import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/paymentController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const paymentRoutes = Router();

paymentRoutes.use(requireAuth);
paymentRoutes.post("/checkout", controller.createCheckoutSession);
paymentRoutes.post("/:id/confirm-demo", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.confirmDemoPayment);
paymentRoutes.use(requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN));
paymentRoutes.get("/", controller.listPayments);
paymentRoutes.post("/", controller.createPayment);
paymentRoutes.patch("/:id", controller.updatePayment);
