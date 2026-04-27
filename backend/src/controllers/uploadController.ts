import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, "Image file is required");
  res.status(201).json({
    url: `${env.PUBLIC_API_URL}/uploads/${req.file.filename}`,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});

export const deleteUploadedImage = asyncHandler(async (req, res) => {
  const fileName = path.basename(req.params.fileName);
  const filePath = path.join(process.cwd(), "uploads", fileName);
  if (!fs.existsSync(filePath)) throw new AppError(404, "Uploaded file not found");
  await fs.promises.unlink(filePath);
  res.status(204).send();
});
