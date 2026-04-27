import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { Role, SubscriptionStatus } from "@prisma/client";
import { env } from "../config/env";

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  institutionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  isActive: boolean;
}

export const signAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions);

export const signRefreshToken = (payload: { id: string }) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);

export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const refreshExpiry = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};
