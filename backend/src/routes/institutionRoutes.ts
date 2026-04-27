import { Role } from "@prisma/client";
import { Router } from "express";
import * as controller from "../controllers/institutionController";
import { requireAuth, requireRoles } from "../middlewares/auth";

export const institutionRoutes = Router();

institutionRoutes.use(requireAuth);
institutionRoutes.get("/", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.listInstitutions);
institutionRoutes.post("/", requireRoles(Role.SUPER_ADMIN), controller.createInstitution);
institutionRoutes.post("/join", controller.joinByCode);
institutionRoutes.get("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.getInstitution);
institutionRoutes.patch("/:id", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.updateInstitution);
institutionRoutes.delete("/:id", requireRoles(Role.SUPER_ADMIN), controller.deleteInstitution);
institutionRoutes.post("/:id/suspend", requireRoles(Role.SUPER_ADMIN), controller.suspendInstitution);
institutionRoutes.post("/:id/regenerate-code", requireRoles(Role.SUPER_ADMIN, Role.INSTITUTION_ADMIN), controller.regenerateInstitutionCode);
