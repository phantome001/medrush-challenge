import { z } from "zod";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { filterPremiumItems } from "../services/accessService";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { parseListQuery } from "../utils/query";
import { assertCanManageInstitutionId, tenantScopedInstitutionId } from "../utils/tenant";
import { Role } from "@prisma/client";

const schema = z.object({
  title: z.string().min(2),
  patientAge: z.number().int().min(0),
  patientGender: z.enum(["MALE", "FEMALE", "OTHER"]),
  symptoms: z.string(),
  history: z.string(),
  physicalExam: z.string(),
  labResults: z.string().optional().nullable(),
  question: z.string(),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  correctAnswer: z.string(),
  explanation: z.string(),
  learningNote: z.string(),
  specialty: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("EASY"),
  isPremium: z.boolean().default(false),
  institutionId: z.string().optional().nullable()
});

export const listClinicalCases = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const query = parseListQuery(req.query);
  const where = {
    ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { OR: [{ institutionId: null }, { institutionId: authReq.user?.institutionId }] }),
    ...(query.specialty ? { specialty: query.specialty } : {}),
    ...(query.difficulty ? { difficulty: query.difficulty as "EASY" | "MEDIUM" | "HARD" } : {}),
    ...(query.isPremium !== undefined ? { isPremium: query.isPremium } : {}),
    ...(query.search ? { OR: [{ title: { contains: query.search, mode: "insensitive" as const } }, { symptoms: { contains: query.search, mode: "insensitive" as const } }] } : {})
  };
  const [cases, total] = await prisma.$transaction([
    prisma.clinicalCase.findMany({ where, orderBy: { createdAt: "desc" }, skip: query.skip, take: query.take }),
    prisma.clinicalCase.count({ where })
  ]);
  res.json({ data: filterPremiumItems(cases, authReq.user!), meta: { total, page: query.page, pageSize: query.pageSize } });
});

export const getClinicalCase = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const clinicalCase = await prisma.clinicalCase.findUnique({ where: { id: req.params.id } });
  if (!clinicalCase) throw new AppError(404, "Clinical case not found");
  if (authReq.user?.role !== Role.SUPER_ADMIN && clinicalCase.institutionId && clinicalCase.institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");
  if (clinicalCase.isPremium && authReq.user?.subscriptionStatus !== "ACTIVE") throw new AppError(402, "Premium subscription required");
  res.json(clinicalCase);
});

export const createClinicalCase = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = schema.parse(req.body);
  const institutionId = tenantScopedInstitutionId(authReq.user, data.institutionId);
  res.status(201).json(await prisma.clinicalCase.create({ data: { ...data, institutionId, createdBy: authReq.user?.id } }));
});

export const updateClinicalCase = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.clinicalCase.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "Clinical case not found");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  const data = schema.partial().parse(req.body);
  const institutionId = data.institutionId !== undefined ? tenantScopedInstitutionId(authReq.user, data.institutionId) : undefined;
  res.json(await prisma.clinicalCase.update({ where: { id: req.params.id }, data: { ...data, institutionId } }));
});

export const deleteClinicalCase = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.clinicalCase.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "Clinical case not found");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  await prisma.clinicalCase.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const submitClinicalAnswer = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const answer = z.object({ answer: z.string() }).parse(req.body).answer;
  const clinicalCase = await prisma.clinicalCase.findUnique({ where: { id: req.params.id } });
  if (!clinicalCase) throw new AppError(404, "Clinical case not found");
  if (authReq.user?.role !== Role.SUPER_ADMIN && clinicalCase.institutionId && clinicalCase.institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");
  res.json({
    correct: clinicalCase.correctAnswer === answer,
    correctAnswer: clinicalCase.correctAnswer,
    explanation: clinicalCase.explanation,
    learningNote: clinicalCase.learningNote,
    disclaimer: "This app is for educational purposes only and does not replace professional medical advice."
  });
});
