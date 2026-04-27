import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/leaderboardController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const leaderboardRoutes = Router();

leaderboardRoutes.use(requireAuth);
leaderboardRoutes.get("/", controller.getLeaderboard);
leaderboardRoutes.get("/export", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.exportLeaderboard);
leaderboardRoutes.post("/reset", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.resetLeaderboard);
