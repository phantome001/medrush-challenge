import { NextFunction, Response } from "express";
import { Role, SubscriptionStatus } from "@prisma/client";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/tokens";

export const requireAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError(401, "Missing bearer token");

    const payload = verifyAccessToken(header.replace("Bearer ", ""));
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, institutionId: true, subscriptionStatus: true, isActive: true }
    });

    if (!user || !user.isActive) throw new AppError(401, "Inactive or invalid user");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles =
  (...roles: Role[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, "Authentication required");
    if (!roles.includes(req.user.role)) throw new AppError(403, "Insufficient permissions");
    next();
  };

export const requirePremium = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  const allowedStatuses: SubscriptionStatus[] = [SubscriptionStatus.ACTIVE];
  const institutionUser = req.user.institutionId && req.user.subscriptionStatus !== SubscriptionStatus.EXPIRED;
  if (!allowedStatuses.includes(req.user.subscriptionStatus) && !institutionUser && req.user.role !== Role.SUPER_ADMIN) {
    throw new AppError(402, "Premium subscription required");
  }
  next();
};

export const requireTenantAccess = (institutionId: string | null | undefined, user: AuthenticatedRequest["user"]) => {
  if (!user) throw new AppError(401, "Authentication required");
  if (user.role === Role.SUPER_ADMIN) return;
  if (!institutionId || institutionId !== user.institutionId) throw new AppError(403, "Tenant access denied");
};
