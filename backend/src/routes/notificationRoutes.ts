import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/notificationController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get("/", controller.listNotifications);
notificationRoutes.post("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.createNotification);
notificationRoutes.patch("/:id/read", controller.markRead);
