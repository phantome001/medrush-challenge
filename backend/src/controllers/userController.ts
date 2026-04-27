import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { hashPassword } from "../utils/password";
import { parseListQuery } from "../utils/query";
import { assertCanManageInstitutionId, tenantScopedInstitutionId } from "../utils/tenant";

const userSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.nativeEnum(Role),
  institutionId: z.string().nullable().optional(),
  specialty: z.string().optional(),
  studyYear: z.string().optional(),
  subscriptionStatus: z.enum(["FREE", "ACTIVE", "EXPIRED", "SUSPENDED"]).optional()
});

const safeSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  avatar: true,
  institutionId: true,
  specialty: true,
  studyYear: true,
  xp: true,
  level: true,
  coins: true,
  streak: true,
  bestStreak: true,
  totalCorrectAnswers: true,
  totalWrongAnswers: true,
  totalQuizzes: true,
  isActive: true,
  subscriptionStatus: true,
  createdAt: true,
  updatedAt: true
};

export const listUsers = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const query = parseListQuery(req.query);
  const role = query.role as Role | undefined;
  const institutionId = query.institutionId;
  const where = {
    ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { institutionId: authReq.user?.institutionId }),
    ...(institutionId && authReq.user?.role === Role.SUPER_ADMIN ? { institutionId } : {}),
    ...(role ? { role } : {}),
    ...(query.search ? { OR: [{ fullName: { contains: query.search, mode: "insensitive" as const } }, { email: { contains: query.search, mode: "insensitive" as const } }] } : {})
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: safeSelect,
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    }),
    prisma.user.count({ where })
  ]);
  res.json({ data: users, meta: { total, page: query.page, pageSize: query.pageSize } });
});

export const listUsersRaw = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const query = parseListQuery({ ...req.query, pageSize: req.query.pageSize ?? 100 });
  const users = await prisma.user.findMany({
    where: { ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { institutionId: authReq.user?.institutionId }), ...(query.role ? { role: query.role as Role } : {}) },
    select: safeSelect,
    orderBy: { createdAt: "desc" },
    take: query.take
  });
  res.json(users);
});

export const createUser = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = userSchema.parse(req.body);
  const institutionId = tenantScopedInstitutionId(authReq.user, data.institutionId);
  if (authReq.user?.role !== Role.SUPER_ADMIN && data.role === Role.SUPER_ADMIN) throw new AppError(403, "Cannot create super admins");
  if (authReq.user?.role === Role.INSTITUTION_ADMIN && data.role === Role.INSTITUTION_ADMIN) throw new AppError(403, "Institution admins cannot create peer admins");

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash: await hashPassword(data.password ?? "ChangeMe123456"),
      role: data.role,
      institutionId,
      specialty: data.specialty,
      studyYear: data.studyYear,
      subscriptionStatus: data.subscriptionStatus
    },
    select: safeSelect
  });
  res.status(201).json(user);
});

export const getUser = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: safeSelect });
  if (!user) throw new AppError(404, "User not found");
  if (authReq.user?.role !== Role.SUPER_ADMIN && user.institutionId !== authReq.user?.institutionId) throw new AppError(403, "Access denied");
  res.json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = userSchema.partial().parse(req.body);
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "User not found");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  const institutionId = data.institutionId !== undefined ? tenantScopedInstitutionId(authReq.user, data.institutionId) : undefined;
  if (authReq.user?.role !== Role.SUPER_ADMIN && data.role === Role.SUPER_ADMIN) throw new AppError(403, "Cannot promote users to super admin");

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      fullName: data.fullName,
      email: data.email?.toLowerCase(),
      role: data.role,
      institutionId,
      specialty: data.specialty,
      studyYear: data.studyYear,
      subscriptionStatus: data.subscriptionStatus,
      passwordHash: data.password ? await hashPassword(data.password) : undefined
    },
    select: safeSelect
  });
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "User not found");
  if (existing.id === authReq.user?.id) throw new AppError(400, "You cannot delete your own account");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const suspendUser = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "User not found");
  if (existing.id === authReq.user?.id) throw new AppError(400, "You cannot suspend your own account");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false }, select: safeSelect });
  res.json(user);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "User not found");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  const password = z.object({ password: z.string().min(8) }).parse(req.body).password;
  await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash: await hashPassword(password) } });
  res.json({ message: "Password reset" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = z
    .object({
      fullName: z.string().min(2).optional(),
      avatar: z.string().url().optional(),
      specialty: z.string().optional(),
      studyYear: z.string().optional()
    })
    .parse(req.body);
  const user = await prisma.user.update({ where: { id: authReq.user?.id }, data, select: safeSelect });
  res.json(user);
});
