import React, { useState } from "react";
import { ConfigProvider, Button, theme } from "antd";
import ImportStep1 from "./components/Import/ImportStep1";
import ImportStep2 from "./components/Import/ImportStep2";
import ImportStep3 from "./components/Import/ImportStep3";
import ImportStep4 from "./components/Import/ImportStep4";  

type PreviewData = any[];

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  type ImportType = "ticket" | "contact" | "organization";
  const [importType, setImportType] = useState<ImportType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);  
  const [previewData, setPreviewData] = useState<PreviewData>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [resultData, setResultData] = useState<any>(null); 
  const [darkMode, setDarkMode] = useState(false);

  const handleNextFromStep1 = async (type: ImportType, file: File) => {
    setImportType(type);
    setFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewData(data.preview);
        setFileId(data.fileId || data.fileId || null); 
        setStep(2);
      } else {
        alert(data.error || "Dosya yükleme hatası");
      }
    } catch (err) {
      alert("Sunucuya bağlanırken hata oluştu");
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setPreviewData([]);
    setFile(null);
    setImportType(null);
    setMapping({});
    setFileId(null);
    setResultData(null);
  };

  const handleNextFromStep2 = () => {
    setStep(3);
  };

  const handleBackToStep2 = () => {
    setStep(2);
  };

  const handleNextFromStep3 = async (mapping: Record<string, string>) => {
    if (!fileId) {
      alert("Dosya ID'si bulunamadı.");
      return;
    }
  
    setMapping(mapping);
  
    try {
      const res = await fetch(`${API_BASE}/map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          mapping,
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setResultData(data);
        setStep(4);
      } else {
        alert(data.message || "Mapping sırasında hata oluştu.");
      }
    } catch (error) {
      alert("Sunucuya bağlanırken hata oluştu.");
    }
  };

  const handleBackToStep3 = () => {
    setStep(3);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#722ed1",
          colorInfo: "#722ed1",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
        },
      }}
    >
      <div style={{ padding: 20, minHeight: "100vh", background: darkMode ? "#141414" : "#fff" }}>
        <Button
          onClick={() => setDarkMode(!darkMode)}
          style={{ marginBottom: 20 }}
        >
          {darkMode ? "Gündüz Modu" : "Gece Modu"}
        </Button>

        {step === 1 && <ImportStep1 onNext={handleNextFromStep1} darkMode={darkMode} />}
        {step === 2 && (
          <ImportStep2
            previewData={previewData}
            onBack={handleBackToStep1}
            onNext={handleNextFromStep2}
            darkMode={darkMode}
          />
        )}
        {step === 3 && (
          <ImportStep3
            previewData={previewData}
            onBack={handleBackToStep2}
            onNext={handleNextFromStep3}
            fileId={fileId}
            darkMode={darkMode}
            importType={importType!} 
          />
        )}
        {step === 4 && resultData && (
          <ImportStep4
            resultData={resultData}
            onBack={handleBackToStep3}
            darkMode={darkMode}
          />
        )}
      </div>
    </ConfigProvider>
  );
};

export default App;
