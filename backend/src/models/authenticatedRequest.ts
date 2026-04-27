import { Request } from "express";
import { Role, SubscriptionStatus } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  institutionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
