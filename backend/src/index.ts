import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import 'dotenv/config';
import uploadRoutes from "./routes/upload";
import mapRouter from "./routes/map";
import downloadRouter from "./routes/download";
import templateRouter from "./routes/template";
import googleDriveRoutes from "./routes/googleDrive";
import { errorHandler } from "./middleware/errorHandler";

["uploads", "output", "src/templates"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api", uploadRoutes);
app.use("/api", mapRouter);
app.use("/api", templateRouter);
app.use("/api", downloadRouter);
app.use("/api/google-drive", googleDriveRoutes);

app.use(errorHandler);

app.use("/output", express.static(path.join(__dirname, "..", "output")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
