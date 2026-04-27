import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/userController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.listUsers);
userRoutes.post("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.createUser);
userRoutes.patch("/profile", controller.updateProfile);
userRoutes.get("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.getUser);
userRoutes.patch("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.updateUser);
userRoutes.delete("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.deleteUser);
userRoutes.post("/:id/suspend", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.suspendUser);
userRoutes.post("/:id/reset-password", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.resetPassword);
