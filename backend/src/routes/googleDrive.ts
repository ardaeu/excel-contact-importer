import express from "express";
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;
const TOKEN_PATH = path.join(__dirname, "..", "token.json");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);


router.get("/auth", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
  res.redirect(authUrl);
});

router.get("/oauth2callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Code parametresi eksik.");

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

    res.send(`
      <html>
        <head>
          <title>Google Drive Bağlandı</title>
        </head>
        <body>
          <script>
            // Eğer popup olarak açılmışsa, ana pencereye odaklan ve popup'u kapat
            if (window.opener) {
              window.opener.focus();
              window.close();
            } else {
              document.body.innerHTML = '<p>Google Drive bağlantısı başarıyla kuruldu! Bu sayfayı kapatabilirsiniz.</p>';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error(err);
    res.status(500).send("OAuth bağlantısı kurulurken bir hata oluştu.");
  }
});

router.post("/upload-to-drive", async (req, res) => {
  try {
    const { filePath, fileName } = req.body;

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "Dosya bulunamadı." });
    }

    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(400).json({ error: "OAuth token yok. Lütfen /auth ile giriş yapın." });
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const fileMetadata = { name: fileName };
    const media = { body: fs.createReadStream(filePath) };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, webViewLink",
    });

    res.json(response.data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
