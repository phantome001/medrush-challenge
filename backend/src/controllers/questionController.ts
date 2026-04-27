import { z } from "zod";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { filterPremiumItems } from "../services/accessService";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { parseListQuery } from "../utils/query";
import { assertCanManageInstitutionId } from "../utils/tenant";
import { Role } from "@prisma/client";

const schema = z.object({
  quizId: z.string().optional().nullable(),
  categoryId: z.string(),
  questionText: z.string().min(3),
  imageUrl: z.string().optional().nullable(),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  correctAnswer: z.string(),
  explanation: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("EASY"),
  isPremium: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

export const listQuestions = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const query = parseListQuery(req.query);
  const where = {
    ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { OR: [{ quiz: { institutionId: null } }, { quiz: { institutionId: authReq.user?.institutionId } }, { quizId: null }] }),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.difficulty ? { difficulty: query.difficulty as "EASY" | "MEDIUM" | "HARD" } : {}),
    ...(query.isPremium !== undefined ? { isPremium: query.isPremium } : {}),
    ...(query.search ? { questionText: { contains: query.search, mode: "insensitive" as const } } : {})
  };
  const [questions, total] = await prisma.$transaction([
    prisma.question.findMany({ where, include: { category: true, quiz: true }, skip: query.skip, take: query.take, orderBy: { createdAt: "desc" } }),
    prisma.question.count({ where })
  ]);
  res.json({ data: filterPremiumItems(questions, authReq.user!), meta: { total, page: query.page, pageSize: query.pageSize } });
});

export const randomQuestions = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const count = Number(req.query.count ?? 10);
  const questions = await prisma.question.findMany({
    where: { ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { OR: [{ quiz: { institutionId: null } }, { quiz: { institutionId: authReq.user?.institutionId } }, { quizId: null }] }) },
    include: { category: true },
    take: 300
  });
  const visible = filterPremiumItems(questions, authReq.user!).sort(() => Math.random() - 0.5).slice(0, count);
  res.json(visible);
});

export const createQuestion = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = schema.parse(req.body);
  if (data.quizId) {
    const quiz = await prisma.quiz.findUnique({ where: { id: data.quizId } });
    if (!quiz) throw new AppError(404, "Quiz not found");
    assertCanManageInstitutionId(authReq.user, quiz.institutionId);
  }
  res.status(201).json(await prisma.question.create({ data }));
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.question.findUnique({ where: { id: req.params.id }, include: { quiz: true } });
  if (!existing) throw new AppError(404, "Question not found");
  assertCanManageInstitutionId(authReq.user, existing.quiz?.institutionId ?? null);
  const data = schema.partial().parse(req.body);
  if (data.quizId) {
    const quiz = await prisma.quiz.findUnique({ where: { id: data.quizId } });
    if (!quiz) throw new AppError(404, "Quiz not found");
    assertCanManageInstitutionId(authReq.user, quiz.institutionId);
  }
  res.json(await prisma.question.update({ where: { id: req.params.id }, data }));
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.question.findUnique({ where: { id: req.params.id }, include: { quiz: true } });
  if (!existing) throw new AppError(404, "Question not found");
  assertCanManageInstitutionId(authReq.user, existing.quiz?.institutionId ?? null);
  await prisma.question.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
