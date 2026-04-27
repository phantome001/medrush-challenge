import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/subscriptionController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const subscriptionRoutes = Router();

subscriptionRoutes.use(requireAuth);
subscriptionRoutes.get("/plans", controller.listPlans);
subscriptionRoutes.get("/status", controller.checkStatus);
subscriptionRoutes.post("/plans", requireRoles(Role.SUPER_ADMIN), controller.createPlan);
subscriptionRoutes.patch("/plans/:id", requireRoles(Role.SUPER_ADMIN), controller.updatePlan);
subscriptionRoutes.delete("/plans/:id", requireRoles(Role.SUPER_ADMIN), controller.deletePlan);
subscriptionRoutes.post("/assign", requireRoles(Role.SUPER_ADMIN), controller.assignPlan);
subscriptionRoutes.post("/expire", requireRoles(Role.SUPER_ADMIN), controller.expireSubscriptions);
