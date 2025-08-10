import React from "react";
import { Table, Button, Steps } from "antd";

const { Step } = Steps;

interface Props {
  previewData: any[];
  onBack: () => void;
  onNext: () => void;
  darkMode: boolean;  // prop olarak eklendi
}

const ImportStep2: React.FC<Props> = ({ previewData, onBack, onNext, darkMode }) => {
  const columns =
    previewData.length > 0
      ? Object.keys(previewData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key,
        }))
      : [];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "auto",
        padding: 20,
        backgroundColor: darkMode ? "#141414" : "#fff",  // koyu tema arkaplan
        color: darkMode ? "#fff" : "#000",               // koyu tema yazı rengi
        minHeight: "100vh",
      }}
    >
      <Steps
        current={1}
        style={{ marginBottom: 24 }}
        direction="horizontal"
        size="small"
        // dark veya default tema için:
        // antd 5.x sürümünde theme 'dark' propsu yok, CSS ile dark mode uygulamalısın
        // Ama biz inline style ile arka plan ve yazı rengini değiştirdik.
      >
        <Step title="Tip ve Dosya Seçimi" />
        <Step title="Yükleme Önizleme" />
        <Step title="Alan Eşleme" />
        <Step title="Sonuç" />
      </Steps>

      <h2 style={{ color: darkMode ? "#fff" : "#000" }}>
        Dosya Önizleme (İlk 5 Satır)
      </h2>
      <Table
        dataSource={previewData}
        columns={columns}
        rowKey={(_, index) => String(index)}
        pagination={false}
        // Tabloyu koyu tema için biraz koyu yapalım:
        style={{ backgroundColor: darkMode ? "#1f1f1f" : "#fff" }}
        // antd tabloda tam koyu tema yok, özel CSS ile iyileştirilebilir
      />
      <div style={{ marginTop: 20, textAlign: "right" }}>
        <Button onClick={onBack} style={{ marginRight: 10 }}>
          Geri
        </Button>
        <Button type="primary" onClick={onNext}>
          İleri
        </Button>
      </div>
    </div>
  );
};

export default ImportStep2;
