import React, { useState } from "react";
import { Radio, Upload, Button, message, Steps } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Step } = Steps;

type ImportType = "ticket" | "contact" | "organization";

interface Props {
  onNext: (importType: ImportType, file: File) => void;
  darkMode: boolean;
}

const ImportStep1: React.FC<Props> = ({ onNext, darkMode }) => {
    type ImportType = "ticket" | "contact" | "organization";
    const [importType, setImportType] = useState<ImportType | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleTypeChange = (e: any) => {
    setImportType(e.target.value);
  };

  const beforeUpload = (file: File) => {
    const isExcelOrCSV =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.type === "text/csv";
    if (!isExcelOrCSV) {
      message.error("Lütfen Excel (.xlsx, .xls) veya CSV dosyası yükleyin!");
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    return false; 
  };

  const handleNext = () => {
    if (importType && file) {
      onNext(importType, file);
    } else {
      message.warning("Lütfen import tipi seçin ve dosya yükleyin.");
    }
  };

  const textColor = darkMode ? "#fff" : "#000";

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, textAlign: "center" }}>
      <div style={{ maxWidth: 900, margin: "auto", padding: 20, textAlign: "center" }}>
        <Steps current={0} style={{ marginBottom: 24, color: textColor }} 
          items={[
            { title: "Tip ve Dosya Seçimi" },
            { title: "Yükleme Önizleme" },
            { title: "Alan Eşleme" },
            { title: "Sonuç" },
          ]}
        />
      </div>

      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <h2 style={{ color: textColor }}>Import Tipini Seçin</h2>
        <Radio.Group onChange={handleTypeChange} value={importType} style={{ color: textColor }}>
          <Radio value="ticket" style={{ color: textColor }}>Ticket</Radio>
          <Radio value="contact" style={{ color: textColor }}>Contact</Radio>
          <Radio value="organization" style={{ color: textColor }}>Organization</Radio>
        </Radio.Group>

        <div style={{ marginTop: 20 }}>
          <Upload
            beforeUpload={beforeUpload}
            maxCount={1}
            accept=".xlsx,.xls,.csv"
            showUploadList={file ? true : false}
            onRemove={() => setFile(null)}
          >
            <Button icon={<UploadOutlined />}>Dosya Yükle</Button>
          </Upload>
        </div>

        <Button
          type="primary"
          style={{ marginTop: 20 }}
          onClick={handleNext}
          disabled={!importType || !file}
        >
          İleri
        </Button>
      </div>
    </div>
  );
};

export default ImportStep1;
