import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/clinicalCaseController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const clinicalCaseRoutes = Router();

clinicalCaseRoutes.use(requireAuth);
clinicalCaseRoutes.get("/", controller.listClinicalCases);
clinicalCaseRoutes.get("/:id", controller.getClinicalCase);
clinicalCaseRoutes.post("/:id/submit", controller.submitClinicalAnswer);
clinicalCaseRoutes.post("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.createClinicalCase);
clinicalCaseRoutes.patch("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.updateClinicalCase);
clinicalCaseRoutes.delete("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN, Role.TEACHER), controller.deleteClinicalCase);
