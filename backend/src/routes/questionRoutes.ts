import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/questionController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const questionRoutes = Router();

questionRoutes.use(requireAuth);
questionRoutes.get("/", controller.listQuestions);
questionRoutes.get("/random", controller.randomQuestions);
questionRoutes.post("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.createQuestion);
questionRoutes.patch("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.updateQuestion);
questionRoutes.delete("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.deleteQuestion);
