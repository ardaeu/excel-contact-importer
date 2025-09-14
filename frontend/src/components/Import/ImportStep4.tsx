import React, { useState } from "react";
import { Table, Button, Typography, Steps, Spin, message } from "antd";

const { Text } = Typography;
const { Step } = Steps;

interface Props {
  resultData: {
    preview: any[];
    outputFile: string;
  };
  onBack: () => void;
  darkMode: boolean;
}

const ImportStep4: React.FC<Props> = ({ resultData, onBack, darkMode }) => {
  const { preview, outputFile } = resultData;
  const [showJson, setShowJson] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [driveFileLink, setDriveFileLink] = useState<string | null>(null);

  const columns = preview.length
    ? Object.keys(preview[0]).map((key) => {
        if (key === "_status") {
          return {
            title: "Durum",
            dataIndex: "_status",
            key: "_status",
            render: (statusObj: { status: string; issues: string[] }) => {
              if (!statusObj) return null;
              if (statusObj.status === "success") return <Text type="success">Başarılı</Text>;
              if (statusObj.status === "incomplete") {
                return (
                  <div>
                    {statusObj.issues.map((issue, idx) => (
                      <div key={idx} style={{ color: "orange" }}>
                        {issue}
                      </div>
                    ))}
                  </div>
                );
              }
              return <Text type="danger">{statusObj.status}</Text>;
            },
            width: 200,
          };
        }
        return { title: key, dataIndex: key, key };
      })
    : [];

  const handleDownload = () => {
    const filename = outputFile.split("/").pop() || "output.json";
    const url = `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/download/${filename}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleJsonPreview = () => {
    setShowJson((prev) => !prev);
  };

  const handleUploadToDrive = async () => {
    setUploading(true);

    try {
      const filename = outputFile.split("/").pop() || "output.json";
      const filePath = outputFile;

      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/google-drive/upload-to-drive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, fileName: filename }),
      });

      if (res.status === 400) {
        const data = await res.json();
        if (data.error?.includes("OAuth token yok")) {
          window.open(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/google-drive/auth`, "_blank");
          message.info("Google OAuth penceresi açıldı. Lütfen yetkilendirme tamamlayın ve tekrar yükleyin.");
          setUploading(false);
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Google Drive yükleme hatası");
      }

      const data = await res.json();
      setDriveFileLink(data.webViewLink);
      message.success("Dosya başarıyla Google Drive’a yüklendi!");
    } catch (err: any) {
      message.error(err.message || "Yükleme sırasında hata oluştu");
    } finally {
      setUploading(false);
    }
  };

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
      <Steps current={3} style={{ marginBottom: 30 }}>
        <Step title="Tip ve Dosya Seçimi" />
        <Step title="Yükleme Önizleme" />
        <Step title="Mapping" />
        <Step title="Sonuç" />
      </Steps>

      <h2 style={{ color: darkMode ? "#fff" : "#000" }}>Sonuç Önizlemesi</h2>

      <Table
        columns={columns}
        dataSource={preview}
        pagination={false}
        bordered
        rowKey={(record, idx) => idx?.toString() ?? record.key ?? ""}
        size="middle"
        scroll={{ x: 800 }}
        style={{ backgroundColor: darkMode ? "#1f1f1f" : "#fff" }}
        rowClassName={() => (darkMode ? "dark-table-row" : "")}
      />

      <div style={{ marginTop: 20, textAlign: "right", display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Button onClick={onBack}>Geri</Button>
        <Button onClick={toggleJsonPreview}>JSON Önizleme</Button>
        <Button type="primary" onClick={handleDownload}>
          JSON Dosyasını İndir
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: "#4285F4", borderColor: "#4285F4" }}
          onClick={() => {
            if (driveFileLink) {
              window.open(driveFileLink, "_blank");
            } else {
              handleUploadToDrive();
            }
          }}
          disabled={uploading}
        >
          {uploading ? <Spin /> : driveFileLink ? "Google Drive'da Göster" : "Google Drive'a Yükle"}
        </Button>
      </div>

      {showJson && (
        <pre
          style={{
            marginTop: 20,
            maxHeight: 300,
            overflow: "auto",
            backgroundColor: darkMode ? "#1f1f1f" : "#f0f0f0",
            color: darkMode ? "#fff" : "#000",
            padding: 15,
            borderRadius: 4,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {JSON.stringify(preview, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ImportStep4;
