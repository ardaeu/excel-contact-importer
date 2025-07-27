import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/upload";
import fs from "fs";
import mapRouter from "./routes/map";
import templateRouter from "./routes/template";
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

app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
