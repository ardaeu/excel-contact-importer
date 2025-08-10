import React, { useState, useEffect } from "react";
import { Table, Select, Button, Typography, message, Input, Modal, Steps } from "antd";

const { Option } = Select;
const { Text } = Typography;
const { Step } = Steps;

interface Props {
  previewData: any[];
  onBack: () => void;
  onNext: (mapping: Record<string, string>) => void;
  fileId: string | null;
  darkMode: boolean;
  importType: "ticket" | "contact" | "organization";
}

const fieldsMap: Record<string, string[]> = {
  contact: [
    "us.external_id",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Emails",
    "Phones",
    "Organization",
    "Language",
    "Tags",
    "Groups",
    "Role",
    "Enabled",
  ],
  ticket: [
    "ts.external_id",
    "Subject",
    "Description",
    "Creator",
    "Requester",
    "Status",
    "Assignee",
    "Assignee Group",
    "Channel",
    "Type",
    "Priority",
    "Form",
    "Created At",
    "Updated At",
    "Solved At",
    "Tags",
  ],
  organization: [
    "os.external_id",
    "Name",
    "Description",
    "Details",
    "Notes",
    "Group",
    "Domains",
    "Tags",
  ],
};

const ImportStep3: React.FC<Props> = ({
  previewData,
  onBack,
  onNext,
  fileId,
  darkMode,
  importType,
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const columnsHeaders = previewData.length > 0 ? Object.keys(previewData[0]) : [];
  const samples = previewData.slice(0, 2);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    fetch(`${API_BASE}/template/list`)
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates || []);
      })
      .catch(() => message.error("Şablonlar yüklenirken hata oluştu."));
  }, [API_BASE]);

  useEffect(() => {
    if (selectedTemplate) {
      fetch(`${API_BASE}/template/${selectedTemplate}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.mapping) setMapping(data.mapping);
          else message.error("Şablon yüklenemedi.");
        })
        .catch(() => message.error("Şablon yüklenirken hata oluştu."));
    }
  }, [selectedTemplate, API_BASE]);

  const handleSelectChange = (excelCol: string, grispiField: string) => {
    setMapping((prev) => ({
      ...prev,
      [excelCol]: grispiField,
    }));
  };

  const validateMapping = () => {
    const mappedFields = Object.values(mapping);
    if (importType === "contact") {
      const emailMapped = mappedFields.includes("Email") || mappedFields.includes("Emails");
      const phoneMapped = mappedFields.includes("Phone") || mappedFields.includes("Phones");

      if (!emailMapped && !phoneMapped) {
        message.error("Email ve Phone alanlarından en az birini eşlemelisiniz.");
        return false;
      }
    }
    return true;
  };

  const handleNextClick = () => {
    if (!validateMapping()) return;

    if (!fileId) {
      message.error("Dosya bilgisi bulunamadı.");
      return;
    }

    onNext(mapping);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      message.error("Şablon adı boş olamaz.");
      return;
    }

    fetch(`${API_BASE}/template/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTemplateName.trim(), mapping }),
    })
      .then((res) => {
        if (res.ok) {
          message.success("Şablon başarıyla kaydedildi.");
          setSaveModalVisible(false);
          setNewTemplateName("");
          return fetch(`${API_BASE}/template/list`).then((res) => res.json());
        } else {
          throw new Error("Şablon kaydedilemedi.");
        }
      })
      .then((data) => {
        setTemplates(data.templates || []);
      })
      .catch(() => {
        message.error("Şablon kaydedilirken hata oluştu.");
      });
  };

  const grispiFields = fieldsMap[importType] || [];

  const tableColumns = [
    {
      title: "Excel Kolon Adı",
      dataIndex: "excelCol",
      key: "excelCol",
      width: 200,
      render: (text: string) => (
        <Text strong style={{ color: darkMode ? "#fff" : undefined }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Sample 1",
      dataIndex: "sample1",
      key: "sample1",
      width: 150,
      render: (text: string) => (
        <span style={{ color: darkMode ? "#ccc" : undefined }}>{text}</span>
      ),
    },
    {
      title: "Sample 2",
      dataIndex: "sample2",
      key: "sample2",
      width: 150,
      render: (text: string) => (
        <span style={{ color: darkMode ? "#ccc" : undefined }}>{text}</span>
      ),
    },
    {
      title: "Grispi Field",
      dataIndex: "grispiField",
      key: "grispiField",
      width: 200,
      render: (_: any, record: any) => (
        <Select
          style={{ width: "100%" }}
          placeholder="Bir alan seçin"
          value={mapping[record.excelCol]}
          onChange={(value) => handleSelectChange(record.excelCol, value)}
          allowClear
          dropdownStyle={{
            backgroundColor: darkMode ? "#141414" : undefined,
            color: darkMode ? "#fff" : undefined,
          }}
          dropdownRender={(menu) => (
            <div
              style={{
                backgroundColor: darkMode ? "#141414" : undefined,
                color: darkMode ? "#fff" : undefined,
              }}
            >
              {menu}
            </div>
          )}
        >
          {grispiFields.map((field) => (
            <Option key={field} value={field} style={{ color: darkMode ? "#fff" : undefined }}>
              {field}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  const tableData = columnsHeaders.map((col) => ({
    key: col,
    excelCol: col,
    sample1: samples[0] ? samples[0][col] : "",
    sample2: samples[1] ? samples[1][col] : "",
  }));

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "auto",
        padding: 20,
        backgroundColor: darkMode ? "#141414" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <Steps current={2} style={{ marginBottom: 24, color: darkMode ? "#fff" : undefined }}>
        <Step title="Tip ve Dosya Seçimi" />
        <Step title="Yükleme Önizleme" />
        <Step title="Alan Eşleme" />
        <Step title="Sonuç" />
      </Steps>

      <h2 style={{ color: darkMode ? "#fff" : "#000" }}>Alan Eşleme</h2>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: darkMode ? "#fff" : undefined,
        }}
      >
        <Select
          placeholder="Şablon Seçin"
          style={{ width: 200 }}
          value={selectedTemplate || undefined}
          onChange={setSelectedTemplate}
          allowClear
          dropdownStyle={{
            backgroundColor: darkMode ? "#141414" : undefined,
            color: darkMode ? "#fff" : undefined,
          }}
          dropdownRender={(menu) => (
            <div
              style={{
                backgroundColor: darkMode ? "#141414" : undefined,
                color: darkMode ? "#fff" : undefined,
              }}
            >
              {menu}
            </div>
          )}
        >
          {templates.map((t) => (
            <Option key={t} value={t} style={{ color: darkMode ? "#fff" : undefined }}>
              {t}
            </Option>
          ))}
        </Select>

        <Button type="default" onClick={() => setSaveModalVisible(true)}>
          Şablon Kaydet
        </Button>
      </div>

      <Table
        columns={tableColumns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 800 }}
        bordered
        size="middle"
        style={{ backgroundColor: darkMode ? "#1f1f1f" : "#fff" }}
        rowClassName={() => (darkMode ? "dark-table-row" : "")}
      />

      <div style={{ marginTop: 20, textAlign: "right" }}>
        <Button onClick={onBack} style={{ marginRight: 10 }}>
          Geri
        </Button>
        <Button type="primary" htmlType="button" onClick={handleNextClick}>
          İleri
        </Button>
      </div>

      <Modal
        title="Şablon Kaydet"
        visible={saveModalVisible}
        onOk={handleSaveTemplate}
        onCancel={() => setSaveModalVisible(false)}
        okText="Kaydet"
        cancelText="İptal"
        bodyStyle={{ backgroundColor: darkMode ? "#141414" : undefined, color: darkMode ? "#fff" : undefined }}
        okButtonProps={{ style: { backgroundColor: darkMode ? "#722ed1" : undefined, borderColor: darkMode ? "#722ed1" : undefined } }}
        cancelButtonProps={{ style: { color: darkMode ? "#fff" : undefined } }}
      >
        <Input
          placeholder="Şablon Adı"
          value={newTemplateName}
          onChange={(e) => setNewTemplateName(e.target.value)}
          onPressEnter={handleSaveTemplate}
          maxLength={50}
          style={{ backgroundColor: darkMode ? "#1f1f1f" : undefined, color: darkMode ? "#fff" : undefined }}
        />
      </Modal>
    </div>
  );
};

export default ImportStep3;
