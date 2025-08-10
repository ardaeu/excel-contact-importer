import express from "express";
import path from "path";

const router = express.Router();

router.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "..", "output", filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(404).send("Dosya bulunamadı");
    }
  });
});

export default router;
