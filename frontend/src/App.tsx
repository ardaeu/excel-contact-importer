import React, { useState, useEffect } from "react";

const GRISPI_FIELDS = [
  { key: "firstName", label: "Ad" },
  { key: "lastName", label: "Soyad" },
  { key: "email", label: "E-posta" },
  { key: "phone", label: "Telefon" },
];

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[][]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fileId, setFileId] = useState<string>("");

  const [mappedResult, setMappedResult] = useState<any[]>([]);

  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/template/list`);
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
      } else {
        console.warn("Template listesi alınamadı.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onSelectTemplate = async (templateName: string) => {
    setSelectedTemplate(templateName);
    if (!templateName) {
      setMapping({});
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/template/${templateName}`);
      const data = await res.json();
      if (res.ok) {
        setMapping(data.mapping || {});
      } else {
        alert("Şablon yüklenirken hata oluştu.");
      }
    } catch (e) {
      alert("Şablon yüklenirken hata oluştu.");
      console.error(e);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setPreviewRows([]);
    setColumns([]);
    setMapping({});
    setFileId("");
    setMappedResult([]);
    setSelectedTemplate("");
    setNewTemplateName("");
  };

  const handleUpload = async () => {
    if (!file) return alert("Önce bir dosya seçin.");
    setLoadingUpload(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewRows(data.preview);
        setColumns(data.columns);
        setFileId(data.fileId);

        if (!selectedTemplate) {
          const initialMapping: Record<string, string> = {};
          data.columns.forEach((col: string) => {
            initialMapping[col] = "";
          });
          setMapping(initialMapping);
        }
      } else {
        alert(data.error || "Dosya yükleme başarısız.");
      }
    } catch (err) {
      alert("Dosya yüklenirken hata oluştu.");
      console.error(err);
    }
    setLoadingUpload(false);
  };

  const onMappingChange = (excelCol: string, grispiKey: string) => {
    setMapping((prev) => ({ ...prev, [excelCol]: grispiKey }));
    if (selectedTemplate) setSelectedTemplate(""); 
  };

  const handleMap = async () => {
    if (!fileId) return alert("Önce dosya yüklemelisiniz.");

    const unmapped = Object.entries(mapping).filter(([_, v]) => !v);
    if (unmapped.length > 0) {
      if (
        !window.confirm(
          `Bazı kolonlar eşleştirilmedi: ${unmapped
            .map(([k]) => k)
            .join(", ")}. Yine de devam edilsin mi?`
        )
      ) {
        return;
      }
    }

    setLoadingMap(true);

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
        setMappedResult(data.preview || []);
        alert("Mapping başarıyla tamamlandı!");
      } else {
        alert(data.message || "Mapping başarısız.");
      }
    } catch (err) {
      alert("Mapping sırasında hata oluştu.");
      console.error(err);
    }

    setLoadingMap(false);
  };

  const saveTemplate = async () => {
    if (!newTemplateName) return alert("Önce şablon adı girin.");
    if (!mapping || Object.values(mapping).every((v) => !v))
      return alert("Eşleme boş, kaydedilemez.");

    setSavingTemplate(true);
    try {
      const res = await fetch(`${API_BASE}/template/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplateName,
          mapping,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Şablon başarıyla kaydedildi!");
        setNewTemplateName("");
        fetchTemplates(); 
      } else {
        alert(data.message || "Şablon kaydedilemedi.");
      }
    } catch (e) {
      alert("Şablon kaydedilirken hata oluştu.");
      console.error(e);
    }
    setSavingTemplate(false);
  };

  const buttonStyle: React.CSSProperties = {
    cursor: "pointer",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
  };

  const btnBgColor = darkMode ? "#622c91" : "#622c91";
  const btnTextColor = "#fff";
  const btnHoverBgColor = darkMode ? "#461570" : "#461570";

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <header>
        <h1>Grispi Excel Contact Importer</h1>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: btnBgColor,
            color: btnTextColor,
          }}
          className="custom-button"
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? "Gündüz Modu" : "Gece Modu"}
        </button>
      </header>

      <main>
        <section>
          <h2>1. Excel Dosyası Yükle</h2>
          <input type="file" accept=".xlsx,.xls" id="fileUpload" onChange={onFileChange} style={{ display: "none" }} />
          <label htmlFor="fileUpload" className="btn-upload" style={{backgroundColor: btnBgColor,
                color: btnTextColor,}} >
            {file ? file.name : "Dosya Seç"}
          </label>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: btnBgColor,
              color: btnTextColor,
              marginLeft: "10px",
            }}
            className="custom-button"
            disabled={loadingUpload}
            onClick={handleUpload}
          >
            {loadingUpload ? "Yükleniyor..." : "Yükle"}
          </button>

          {previewRows.length > 0 && (
            <>
              <h3>Önizleme</h3>
              <table>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell: any, i: number) => (
                        <td key={i}>{cell ?? "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        {previewRows.length > 0 && (
          <section>
            <h2>2. Kolonları Grispi Alanlarıyla Eşleştir</h2>

            <label>
              <strong>Şablon seç (varsa): </strong>
              <select
                value={selectedTemplate}
                onChange={(e) => onSelectTemplate(e.target.value)}
                style={{
                  marginLeft: "10px",
                  padding: "0.3rem",
                  borderRadius: "4px",
                  border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
                  backgroundColor: darkMode ? "#222" : "#fff",
                  color: darkMode ? "#eee" : "#222",
                  minWidth: 180,
                }}
              >
                <option value="">-- Şablon Yok --</option>
                {templates.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <table>
              <thead>
                <tr>
                  <th>Excel Kolonu</th>
                  <th>Grispi Alanı</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col) => (
                  <tr key={col}>
                    <td>{col}</td>
                    <td>
                      <select
                        value={mapping[col] || ""}
                        onChange={(e) => onMappingChange(col, e.target.value)}
                        style={{
                          padding: "0.3rem",
                          borderRadius: "4px",
                          border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
                          backgroundColor: darkMode ? "#222" : "#fff",
                          color: darkMode ? "#eee" : "#222",
                          minWidth: 150,
                        }}
                      >
                        <option value="">Eşleştirme Seçin</option>
                        {GRISPI_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 10 }}>
              <input
                type="text"
                placeholder="Yeni şablon adı"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                style={{
                  padding: "0.4rem",
                  borderRadius: "5px",
                  border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
                  backgroundColor: darkMode ? "#222" : "#fff",
                  color: darkMode ? "#eee" : "#222",
                  marginRight: "10px",
                  minWidth: 200,
                }}
              />
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: btnBgColor,
                  color: btnTextColor,
                }}
                className="custom-button"
                disabled={savingTemplate}
                onClick={saveTemplate}
              >
                {savingTemplate ? "Kaydediliyor..." : "Şablon Olarak Kaydet"}
              </button>
            </div>

            <button
              onClick={handleMap}
              disabled={loadingMap}
              style={{
                ...buttonStyle,
                backgroundColor: btnBgColor,
                color: btnTextColor,
                marginTop: "20px",
              }}
              className="custom-button"
            >
              {loadingMap ? "İşleniyor..." : "Eşleştir ve JSON Al"}
            </button>
          </section>
        )}

        {mappedResult.length > 0 && (
          <section>
            <h2>3. JSON Çıktısı (Önizleme)</h2>
            <pre
              style={{
                maxHeight: "300px",
                overflow: "auto",
                backgroundColor: darkMode ? "#1e1e1e" : "#f0f0f0",
                color: darkMode ? "#d4d4d4" : "#333",
                padding: "1rem",
                borderRadius: "6px",
                fontFamily: "Consolas, monospace",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {JSON.stringify(mappedResult, null, 2)}
            </pre>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(mappedResult, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `mapped_result_${fileId || "export"}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                ...buttonStyle,
                backgroundColor: btnBgColor,
                color: btnTextColor,
                marginTop: "10px",
              }}
              className="custom-button"
            >
              JSON Dosyasını İndir
            </button>
          </section>
        )}
      </main>

      <style>{`
        body, html, #root, .app {
          min-height: 160vh;
          margin: 0; padding: 0; height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          background-color: var(--bg);
          color: var(--text);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .app.light {
          --bg: #f5f5f5;
          --text: #222;
          --btn-bg: rgba(98, 44, 145, 1);
          --btn-text: #fff;
          --table-bg: #fff;
          --table-border: #ccc;
        }
        .app.dark {
          --bg: #121212;
          --text: #eee;
          --btn-bg:rgba(98, 44, 145, 1);
          --btn-text: #fff;
          --table-bg: #222;
          --table-border: #444;
        }
        header {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--table-bg);
          border-bottom: 1px solid var(--table-border);
        }
        button.custom-button {
          cursor: pointer;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        button.custom-button:hover:not(:disabled) {
          background-color: ${btnHoverBgColor};
          box-shadow: 0 6px 12px rgba(0,0,0,0.25);
        }
        button.custom-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        main {
          padding: 1rem;
          max-width: 900px;
          margin: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
        }
        th, td {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--table-border);
          text-align: left;
        }
        select, input[type="text"] {
          padding: 0.3rem;
          border-radius: 4px;
          border: 1px solid var(--table-border);
          background-color: var(--table-bg);
          color: var(--text);
          min-width: 150px;
        }
        input[type="text"] {
          margin-right: 10px;
        }
        main {
          padding: 1rem;
          max-width: 900px;
          margin: auto;
          background-color: var(--main-bg);
          border-radius: 10px;
          transition: background-color 0.3s ease;
        }

        section {
          background-color: var(--section-bg);
          padding: 1rem;
          margin-top: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Light mode */
        .app.light {
          --bg: #f5f5f5;
          --text: #222;
          --btn-bg:rgba(98, 44, 145, 1);
          --btn-text: #fff;
          --table-bg: #fff;
          --table-border: #ccc;
          --main-bg: #fafafa;
          --section-bg: #fff;
        }

        /* Dark mode */
        .app.dark {
          --bg: #121212;
          --text: #eee;
          --btn-bg: rgba(98, 44, 145, 1);
          --btn-text: #fff;
          --table-bg: #222;
          --table-border: #444;
          --main-bg: #1a1a1a;
          --section-bg: #222;
        }
        .btn-upload {
          cursor: pointer;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .btn-upload:hover:not(:disabled) {
          background-color: ${btnHoverBgColor};
          box-shadow: 0 6px 12px rgba(0,0,0,0.25);
        }

        .btn-upload:hover {
          background-color: /* biraz daha koyu veya açık bir renk */;
        }

        .btn-upload:active {
          background-color: /* basılıyken farklı renk */;
        }


      `}</style>
    </div>
  );
}

export default App;
