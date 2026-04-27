import { Role } from "@prisma/client";
import { AuthUser } from "../models/authenticatedRequest";
import { AppError } from "./errors";

export const canManageInstitutionId = (user: AuthUser, institutionId: string | null | undefined) => {
  if (user.role === Role.SUPER_ADMIN) return true;
  return Boolean(user.institutionId && institutionId === user.institutionId);
};

export const assertCanManageInstitutionId = (user: AuthUser | undefined, institutionId: string | null | undefined) => {
  if (!user) throw new AppError(401, "Authentication required");
  if (!canManageInstitutionId(user, institutionId)) throw new AppError(403, "Tenant access denied");
};

export const tenantScopedInstitutionId = (user: AuthUser | undefined, requestedInstitutionId?: string | null) => {
  if (!user) throw new AppError(401, "Authentication required");
  if (user.role === Role.SUPER_ADMIN) return requestedInstitutionId ?? null;
  if (!user.institutionId) throw new AppError(403, "User is not assigned to an institution");
  if (requestedInstitutionId && requestedInstitutionId !== user.institutionId) {
    throw new AppError(403, "Cannot manage data outside your institution");
  }
  return user.institutionId;
};
