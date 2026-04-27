import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Role } from "@prisma/client";
import { Router } from "express";
import multer from "multer";
import * as controller from "../controllers/uploadController";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { AppError } from "../utils/errors";

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      cb(new AppError(400, "Only JPG, PNG, WEBP, and GIF images are allowed"));
      return;
    }
    cb(null, true);
  }
});

export const uploadRoutes = Router();

uploadRoutes.use(requireAuth, requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER));
uploadRoutes.post("/image", imageUpload.single("image"), controller.uploadImage);
uploadRoutes.delete("/:fileName", controller.deleteUploadedImage);
