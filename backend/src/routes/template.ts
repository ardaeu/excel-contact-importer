import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const templatesDir = path.join(__dirname, "..", "..", "templates");
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

router.get("/columns/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(uploadsDir, fileId);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { columns } = JSON.parse(fileContent);

    if (!columns) {
      return res.status(400).json({ message: "Dosyada sütun bilgisi bulunamadı." });
    }

    res.json({ columns });
  } catch (error) {
    console.error("Sütun okuma hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Şablon kaydet (POST)
router.post("/template/save", async (req, res) => {
  try {
    const { name, mapping } = req.body;

    if (!name || !mapping) {
      return res.status(400).json({ message: "Şablon adı ve mapping gerekli." });
    }

    await fs.mkdir(templatesDir, { recursive: true });

    const filePath = path.join(templatesDir, `${name}.json`);
    await fs.writeFile(filePath, JSON.stringify(mapping, null, 2));

    res.json({ message: "Şablon başarıyla kaydedildi." });
  } catch (error) {
    console.error("Şablon kaydetme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Şablonları listele (GET)
router.get("/template/list", async (req, res) => {
  try {
    const files = await fs.readdir(templatesDir);
    const templates = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.basename(file, ".json"));

    res.json({ templates });
  } catch (error) {
    console.error("Şablon listeleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Belirli şablonu getir (GET)
router.get("/template/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const filePath = path.join(templatesDir, `${name}.json`);

    const content = await fs.readFile(filePath, "utf-8");
    const mapping = JSON.parse(content);

    res.json({ name, mapping });
  } catch (error) {
    next(error);
  }
});

export default router;
