import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/categoryController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const categoryRoutes = Router();

categoryRoutes.use(requireAuth);
categoryRoutes.get("/", controller.listCategories);
categoryRoutes.post("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.createCategory);
categoryRoutes.patch("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.updateCategory);
categoryRoutes.delete("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.deleteCategory);
