import { google } from "googleapis";
import path from "path";
import fs from "fs";

const KEYFILE_PATH = path.join(__dirname, "../../credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export const getDriveClient = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: SCOPES,
  });

  return google.drive({ version: "v3", auth });
};

export const uploadFileToDrive = async (
  filePath: string,
  fileName: string,
  mimeType = "application/json",
  folderId?: string
) => {
  const drive = getDriveClient();

  const fileMetadata: any = {
    name: fileName,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink",
  });

  return response.data;
};
