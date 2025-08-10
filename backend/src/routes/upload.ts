import express from "express";
import multer from "multer";
import path from "path";
import ExcelJS from "exceljs";
import fs from "fs/promises";  // fs.promises kullanalım

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ error: "Dosya yüklenemedi" });

    const ext = path.extname(filePath).toLowerCase();

    let headers: string[] = [];
    let previewRows: any[] = [];
    // let allRows: any[] = [];  // eskisi - obje dizisi

    const allRowsArray: any[][] = []; // Yeni - array of arrays formatı

    if (ext === ".xlsx" || ext === ".xls") {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      // İlk satır kolon başlıkları
      const headerRow = worksheet.getRow(1);
      headers = headerRow.values.slice(1) as string[]; // 1’den itibaren alıyoruz, çünkü 0 boş olabilir

      // 2. satırdan başlayarak en fazla 5 satır okuyalım
      for (let i = 2; i <= Math.min(6, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const rowValues = row.values.slice(1);

        const rowObject: Record<string, any> = {};
        headers.forEach((header, idx) => {
          rowObject[header] = rowValues[idx] ?? null;
        });
        previewRows.push(rowObject);
      }

      // Tüm satırları da json için alalım
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        let rowValues = row.values.slice(1).map((v) => (v === undefined ? null : v)); // undefined ise null yap
        allRowsArray.push(rowValues);
      }
    } else if (ext === ".csv") {
      // CSV ise csv-parse veya benzeri bir paket kullanabiliriz ama internetteysek csv-parser yoksa, basit parse yapalım:
      const content = await fs.readFile(filePath, "utf-8");
      const lines = content.split(/\r?\n/).filter(Boolean);
      if (lines.length < 1)
        return res.status(400).json({ error: "CSV dosyası boş." });

      headers = lines[0].split(",").map(h => h.trim());

      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const rowValues = lines[i].split(",").map(v => v.trim());
        const rowObject: Record<string, any> = {};
        headers.forEach((header, idx) => {
          rowObject[header] = rowValues[idx] ?? null;
        });
        previewRows.push(rowObject);
      }

      // Tüm satırlar
      for (let i = 1; i < lines.length; i++) {
        const rowValues = lines[i].split(",").map(v => v.trim() || null);
        allRowsArray.push(rowValues);
      }
    } else {
      return res.status(400).json({ error: "Desteklenmeyen dosya formatı." });
    }

    // JSON dosyasını kaydet (örneğin uploads/uniqueName.json)
    const jsonFilePath = filePath + ".json";
    await fs.writeFile(jsonFilePath, JSON.stringify({ columns: headers, rows: allRowsArray }, null, 2));

    const jsonFileName = path.basename(jsonFilePath);

    return res.json({
      preview: previewRows,
      columns: headers,
      message: "Önizleme başarıyla alındı ve JSON oluşturuldu",
      fileId: jsonFileName,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
