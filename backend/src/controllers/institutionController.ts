import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { parseListQuery } from "../utils/query";

const schema = z.object({
  name: z.string().min(2),
  logo: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  country: z.string().min(2),
  city: z.string().min(2),
  address: z.string().optional().nullable(),
  subscriptionPlanId: z.string().optional().nullable(),
  subscriptionStart: z.string().datetime().optional().nullable(),
  subscriptionEnd: z.string().datetime().optional().nullable(),
  maxStudents: z.number().int().min(0),
  maxTeachers: z.number().int().min(0),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).default("ACTIVE"),
  primaryColor: z.string().default("#2563eb"),
  secondaryColor: z.string().default("#10b981")
});

export const generateInstitutionCode = (name: string) =>
  `${name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const listInstitutions = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const query = parseListQuery(req.query);
  const where = {
    ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { id: authReq.user?.institutionId ?? "" }),
    ...(query.status ? { status: query.status as "ACTIVE" | "SUSPENDED" | "EXPIRED" } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { country: { contains: query.search, mode: "insensitive" as const } },
            { city: { contains: query.search, mode: "insensitive" as const } },
            { institutionCode: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [institutions, total] = await prisma.$transaction([
    prisma.institution.findMany({
      where,
      include: { subscriptionPlan: true, _count: { select: { users: true, quizzes: true } } },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    }),
    prisma.institution.count({ where })
  ]);
  res.json({ data: institutions, meta: { total, page: query.page, pageSize: query.pageSize } });
});

export const createInstitution = asyncHandler(async (req, res) => {
  const data = schema.parse(req.body);
  const institution = await prisma.institution.create({
    data: {
      ...data,
      institutionCode: generateInstitutionCode(data.name),
      subscriptionStart: data.subscriptionStart ? new Date(data.subscriptionStart) : undefined,
      subscriptionEnd: data.subscriptionEnd ? new Date(data.subscriptionEnd) : undefined
    }
  });
  res.status(201).json(institution);
});

export const getInstitution = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user?.role !== Role.SUPER_ADMIN && req.params.id !== authReq.user?.institutionId) throw new AppError(403, "Access denied");
  const institution = await prisma.institution.findUnique({
    where: { id: req.params.id },
    include: { subscriptionPlan: true, users: { select: { id: true, fullName: true, email: true, role: true } } }
  });
  if (!institution) throw new AppError(404, "Institution not found");
  res.json(institution);
});

export const updateInstitution = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user?.role !== Role.SUPER_ADMIN && req.params.id !== authReq.user?.institutionId) throw new AppError(403, "Access denied");
  const data = schema.partial().parse(req.body);
  const institution = await prisma.institution.update({
    where: { id: req.params.id },
    data: {
      ...data,
      subscriptionStart: data.subscriptionStart ? new Date(data.subscriptionStart) : undefined,
      subscriptionEnd: data.subscriptionEnd ? new Date(data.subscriptionEnd) : undefined
    }
  });
  res.json(institution);
});

export const deleteInstitution = asyncHandler(async (req, res) => {
  const counts = await prisma.institution.findUnique({ where: { id: req.params.id }, include: { _count: { select: { users: true, quizzes: true } } } });
  if (!counts) throw new AppError(404, "Institution not found");
  if (counts._count.users > 0 || counts._count.quizzes > 0) throw new AppError(409, "Cannot delete institution with users or quizzes. Suspend it instead.");
  await prisma.institution.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const suspendInstitution = asyncHandler(async (req, res) => {
  const institution = await prisma.institution.update({ where: { id: req.params.id }, data: { status: "SUSPENDED" } });
  res.json(institution);
});

export const regenerateInstitutionCode = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user?.role !== Role.SUPER_ADMIN && req.params.id !== authReq.user?.institutionId) throw new AppError(403, "Access denied");
  const institution = await prisma.institution.findUniqueOrThrow({ where: { id: req.params.id } });
  const updated = await prisma.institution.update({
    where: { id: req.params.id },
    data: { institutionCode: generateInstitutionCode(institution.name) }
  });
  res.json(updated);
});

export const joinByCode = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const code = z.object({ institutionCode: z.string().min(3) }).parse(req.body).institutionCode;
  const institution = await prisma.institution.findUnique({ where: { institutionCode: code } });
  if (!institution || institution.status !== "ACTIVE") throw new AppError(400, "Invalid institution code");
  const user = await prisma.user.update({ where: { id: authReq.user?.id }, data: { institutionId: institution.id } });
  res.json({ institution, userId: user.id });
});
