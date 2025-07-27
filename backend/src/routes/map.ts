import { error } from "console";
import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
const outputDir = path.join(__dirname, "..", "..", "output");
const templatesDir = path.join(__dirname, "..", "..", "templates");

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone: string): boolean {
  const re = /^\+?[\d\s\-]{7,15}$/;
  return re.test(phone);
}

router.post("/map", async (req, res) => {
  try {
    const { fileId, mapping, templateName } = req.body;

    if (!fileId) {
      return res.status(400).json({ message: "fileId gerekli" });
    }

    let actualMapping = mapping;

    if (!mapping && templateName) {
      const templatePath = path.join(templatesDir, `${templateName}.json`);
      try {
        const templateData = await fs.readFile(templatePath, "utf-8");
        actualMapping = JSON.parse(templateData);
      } catch (error) {
        return next(error);
      }
    }

    if (!actualMapping) {
      return res.status(400).json({ message: "mapping veya templateName sağlanmalı" });
    }

    const uploadedFilePath = path.join(uploadsDir, fileId);
    const fileContent = await fs.readFile(uploadedFilePath, "utf-8");
    const { columns, rows } = JSON.parse(fileContent);

    const mappedData = rows.map((row: any[]) => {
      const entry: Record<string, any> = {};
      const status = { status: "success", issues: [] as string[] };

      for (const [excelColName, grispiKey] of Object.entries(actualMapping)) {
        const colIndex = columns.indexOf(excelColName);
        let value = colIndex !== -1 ? row[colIndex] ?? null : null;

        if (typeof value === "string") {
          value = value.trim();
        }

        entry[grispiKey] = value;

        if (!value) {
          status.status = "incomplete";
          status.issues.push(`${grispiKey} eksik`);
        }
      }

      if (entry.email && !isValidEmail(entry.email)) {
        status.status = "invalid";
        status.issues.push("Geçersiz e-posta");
      }

      if (entry.phone && !isValidPhone(entry.phone)) {
        status.status = "invalid";
        status.issues.push("Geçersiz telefon numarası");
      }

      entry._status = status;
      return entry;
    });

    await fs.mkdir(outputDir, { recursive: true });
    const outputFilePath = path.join(outputDir, `${fileId}.json`);
    await fs.writeFile(outputFilePath, JSON.stringify(mappedData, null, 2));

    res.json({
      message: "Veriler başarıyla eşlendi ve JSON olarak kaydedildi.",
      outputFile: `output/${fileId}.json`,
      preview: mappedData.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
