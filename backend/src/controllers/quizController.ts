import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { visibleQuizWhere } from "../services/accessService";
import { applyQuizResult } from "../services/gamificationService";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { parseListQuery } from "../utils/query";
import { assertCanManageInstitutionId, tenantScopedInstitutionId } from "../utils/tenant";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  categoryId: z.string(),
  institutionId: z.string().optional().nullable(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("EASY"),
  isPremium: z.boolean().default(false),
  timeLimit: z.number().int().min(5).default(60),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT")
});

export const listQuizzes = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const query = parseListQuery(req.query);
  const where = {
    ...(authReq.user?.role === Role.STUDENT
      ? visibleQuizWhere(authReq.user)
      : { ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { OR: [{ institutionId: null }, { institutionId: authReq.user?.institutionId }] }) }),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.difficulty ? { difficulty: query.difficulty as "EASY" | "MEDIUM" | "HARD" } : {}),
    ...(query.status ? { status: query.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(query.isPremium !== undefined ? { isPremium: query.isPremium } : {}),
    ...(query.search ? { OR: [{ title: { contains: query.search, mode: "insensitive" as const } }, { description: { contains: query.search, mode: "insensitive" as const } }] } : {})
  };
  const [quizzes, total] = await prisma.$transaction([
    prisma.quiz.findMany({
      where,
      include: { category: true, _count: { select: { questions: true, results: true } } },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    }),
    prisma.quiz.count({ where })
  ]);
  res.json({ data: quizzes, meta: { total, page: query.page, pageSize: query.pageSize } });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id }, include: { category: true, questions: true } });
  if (!quiz) throw new AppError(404, "Quiz not found");
  if (authReq.user?.role !== Role.SUPER_ADMIN && quiz.institutionId && quiz.institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");
  if (quiz.isPremium && authReq.user?.subscriptionStatus !== "ACTIVE" && authReq.user?.role === Role.STUDENT) throw new AppError(402, "Premium subscription required");
  res.json(quiz);
});

export const createQuiz = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = schema.parse(req.body);
  const institutionId = tenantScopedInstitutionId(authReq.user, data.institutionId);
  const quiz = await prisma.quiz.create({ data: { ...data, institutionId, createdBy: authReq.user?.id } });
  res.status(201).json(quiz);
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "Quiz not found");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  const data = schema.partial().parse(req.body);
  const institutionId = data.institutionId !== undefined ? tenantScopedInstitutionId(authReq.user, data.institutionId) : undefined;
  res.json(await prisma.quiz.update({ where: { id: req.params.id }, data: { ...data, institutionId } }));
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.quiz.findUnique({ where: { id: req.params.id }, include: { _count: { select: { results: true } } } });
  if (!existing) throw new AppError(404, "Quiz not found");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  if (existing._count.results > 0) throw new AppError(409, "Cannot delete quiz with submitted results. Archive it instead.");
  await prisma.quiz.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const dailyChallenge = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const questions = await prisma.question.findMany({
    where: {
      ...(authReq.user?.subscriptionStatus === "ACTIVE" ? {} : { isPremium: false }),
      OR: [{ quiz: { institutionId: null } }, { quiz: { institutionId: authReq.user?.institutionId } }, { quizId: null }]
    },
    include: { category: true },
    take: 200
  });
  res.json(questions.sort(() => Math.random() - 0.5).slice(0, 10));
});

export const premiumQuizzes = asyncHandler(async (_req, res) => {
  res.json(await prisma.quiz.findMany({ where: { isPremium: true, status: "PUBLISHED" }, include: { category: true } }));
});

export const submitQuizResult = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = z
    .object({
      quizId: z.string().optional().nullable(),
      correctAnswers: z.number().int().min(0),
      totalQuestions: z.number().int().min(1),
      isDailyChallenge: z.boolean().default(false)
    })
    .parse(req.body);
  if (data.correctAnswers > data.totalQuestions) throw new AppError(400, "Correct answers cannot exceed total questions");
  if (data.quizId) {
    const quiz = await prisma.quiz.findUnique({ where: { id: data.quizId } });
    if (!quiz) throw new AppError(404, "Quiz not found");
    if (authReq.user?.role !== Role.SUPER_ADMIN && quiz.institutionId && quiz.institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");
    if (quiz.isPremium && authReq.user?.subscriptionStatus !== "ACTIVE" && authReq.user?.role === Role.STUDENT) throw new AppError(402, "Premium subscription required");
  }
  const result = await applyQuizResult(authReq.user!.id, data.quizId ?? null, data.correctAnswers, data.totalQuestions, data.isDailyChallenge);
  res.status(201).json(result);
});
