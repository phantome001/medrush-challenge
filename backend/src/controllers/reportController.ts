import { Role } from "@prisma/client";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

export const platformStats = asyncHandler(async (_req, res) => {
  const [totalInstitutions, totalUsers, activeSubscriptions, expiredSubscriptions, totalQuizzes, totalQuestions, payments] = await Promise.all([
    prisma.institution.count(),
    prisma.user.count(),
    prisma.institution.count({ where: { status: "ACTIVE" } }),
    prisma.institution.count({ where: { status: "EXPIRED" } }),
    prisma.quiz.count(),
    prisma.question.count(),
    prisma.payment.findMany({ where: { status: "PAID" } })
  ]);
  const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  res.json({ totalInstitutions, totalUsers, activeSubscriptions, expiredSubscriptions, totalQuizzes, totalQuestions, revenue });
});

export const institutionStats = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const institutionId = (req.query.institutionId as string | undefined) ?? authReq.user?.institutionId;
  if (!institutionId) throw new AppError(400, "Institution id is required");
  if (authReq.user?.role !== Role.SUPER_ADMIN && institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");
  const [students, teachers, quizzes, results] = await Promise.all([
    prisma.user.count({ where: { institutionId, role: "STUDENT" } }),
    prisma.user.count({ where: { institutionId, role: "TEACHER" } }),
    prisma.quiz.count({ where: { institutionId } }),
    prisma.quizResult.count({ where: { user: { institutionId } } })
  ]);
  res.json({ institutionId, students, teachers, quizzes, results });
});

export const quizStats = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const quizWhere = authReq.user?.role === Role.SUPER_ADMIN ? {} : { OR: [{ institutionId: null }, { institutionId: authReq.user?.institutionId }] };
  const mostPlayedQuizzes = await prisma.quiz.findMany({
    where: quizWhere,
    include: { _count: { select: { results: true, questions: true } }, category: true },
    orderBy: { results: { _count: "desc" } },
    take: 10
  });
  const categories = await prisma.category.findMany({ include: { _count: { select: { questions: true, quizzes: true } } } });
  res.json({ mostPlayedQuizzes, categories });
});

export const performanceAnalytics = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const tenantWhere = authReq.user?.role === Role.SUPER_ADMIN ? {} : { institutionId: authReq.user?.institutionId };
  const bestStudents = await prisma.user.findMany({
    where: { role: "STUDENT", ...tenantWhere },
    orderBy: [{ xp: "desc" }, { totalCorrectAnswers: "desc" }],
    select: { id: true, fullName: true, email: true, xp: true, level: true, totalCorrectAnswers: true, totalQuizzes: true },
    take: 10
  });
  const activeStudents = await prisma.user.findMany({
    where: { role: "STUDENT", ...tenantWhere },
    orderBy: { totalQuizzes: "desc" },
    select: { id: true, fullName: true, totalQuizzes: true, streak: true },
    take: 10
  });
  res.json({ bestStudents, activeStudents, mostDifficultQuestions: [] });
});
