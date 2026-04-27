import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/quizController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const quizRoutes = Router();

quizRoutes.use(requireAuth);
quizRoutes.get("/", controller.listQuizzes);
quizRoutes.get("/daily-challenge", controller.dailyChallenge);
quizRoutes.get("/premium", controller.premiumQuizzes);
quizRoutes.post("/submit-result", controller.submitQuizResult);
quizRoutes.get("/:id", controller.getQuiz);
quizRoutes.post("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.createQuiz);
quizRoutes.patch("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.updateQuiz);
quizRoutes.delete("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.deleteQuiz);
