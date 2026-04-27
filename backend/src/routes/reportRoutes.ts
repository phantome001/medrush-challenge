import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/reportController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const reportRoutes = Router();

reportRoutes.use(requireAuth);
reportRoutes.get("/platform", requireRoles(Role.SUPER_ADMIN), controller.platformStats);
reportRoutes.get("/institution", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.institutionStats);
reportRoutes.get("/quizzes", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.quizStats);
reportRoutes.get("/performance", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.performanceAnalytics);
reportRoutes.get("/student-analytics", controller.studentAnalytics);
reportRoutes.get("/teacher", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.teacherReports);
