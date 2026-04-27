import { Role, SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/errors";
import { hashPassword, verifyPassword } from "../utils/password";
import { hashToken, refreshExpiry, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens";

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  institutionCode: z.string().min(3),
  specialty: z.string().min(2),
  studyYear: z.string().min(2)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const sanitizeUser = <T extends { passwordHash?: string }>(user: T) => {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export const issueTokens = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw new AppError(401, "Invalid user");

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    subscriptionStatus: user.subscriptionStatus,
    isActive: user.isActive
  });
  const refreshToken = signRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiry()
    }
  });

  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

export const registerStudent = async (payload: z.infer<typeof registerSchema>) => {
  const data = registerSchema.parse(payload);
  const institution = await prisma.institution.findUnique({ where: { institutionCode: data.institutionCode } });
  if (!institution || institution.status !== "ACTIVE") throw new AppError(400, "Institution code is invalid or inactive");

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new AppError(409, "Email is already registered");

  const studentCount = await prisma.user.count({ where: { institutionId: institution.id, role: Role.STUDENT } });
  if (institution.maxStudents > 0 && studentCount >= institution.maxStudents) {
    throw new AppError(403, "Institution student limit reached");
  }

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash: await hashPassword(data.password),
      role: Role.STUDENT,
      institutionId: institution.id,
      specialty: data.specialty,
      studyYear: data.studyYear,
      subscriptionStatus: SubscriptionStatus.FREE
    }
  });

  return issueTokens(user.id);
};

export const login = async (payload: z.infer<typeof loginSchema>) => {
  const data = loginSchema.parse(payload);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) throw new AppError(401, "Invalid credentials");
  if (!user.isActive) throw new AppError(403, "Account is suspended");
  return issueTokens(user.id);
};

export const refresh = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.id,
      tokenHash: hashToken(token),
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
  if (!stored) throw new AppError(401, "Invalid refresh token");
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  return issueTokens(payload.id);
};

export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() }
  });
};
