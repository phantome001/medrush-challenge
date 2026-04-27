import { Router } from "express";
import * as controller from "../controllers/authController";
import { requireAuth } from "../middlewares/auth";

export const authRoutes = Router();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);
authRoutes.post("/refresh", controller.refresh);
authRoutes.post("/logout", controller.logout);
authRoutes.post("/forgot-password", controller.forgotPassword);
authRoutes.post("/reset-password", controller.resetPassword);
authRoutes.get("/me", requireAuth, controller.me);
