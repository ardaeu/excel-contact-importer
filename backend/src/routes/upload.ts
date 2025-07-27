import express from "express";
import multer from "multer";
import path from "path";
import ExcelJS from "exceljs";
import fs from "fs";

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

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const previewRows: any[] = [];
    const allRows: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values.slice(1); 
      if (rowNumber <= 5) previewRows.push(values);
      allRows.push(values);
    });

    const jsonFilePath = filePath + ".json";
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(
        {
          columns: allRows[0],
          rows: allRows.slice(1),
        },
        null,
        2
      )
    );

    return res.json({
      preview: previewRows,
      columns: previewRows[0],
      message: "Önizleme başarıyla alındı",
      fileId: path.basename(jsonFilePath), 
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
