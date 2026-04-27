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

export const studentAnalytics = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const requestedUserId = (req.query.userId as string | undefined) ?? authReq.user?.id;
  if (!requestedUserId) throw new AppError(400, "User id is required");
  if (authReq.user?.role === Role.STUDENT && requestedUserId !== authReq.user.id) throw new AppError(403, "Students can only view their own analytics");

  const student = await prisma.user.findUnique({ where: { id: requestedUserId }, include: { institution: true } });
  if (!student || student.role !== Role.STUDENT) throw new AppError(404, "Student not found");
  if (authReq.user?.role !== Role.SUPER_ADMIN && student.institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");

  const results = await prisma.quizResult.findMany({
    where: { userId: requestedUserId },
    include: { quiz: { include: { category: true } } },
    orderBy: { completedAt: "desc" },
    take: 25
  });
  const categoryMap = new Map<string, { category: string; attempts: number; correct: number; total: number }>();
  for (const result of results) {
    const category = result.quiz?.category?.name ?? "Daily Challenge";
    const entry = categoryMap.get(category) ?? { category, attempts: 0, correct: 0, total: 0 };
    entry.attempts += 1;
    entry.correct += result.correctAnswers;
    entry.total += result.correctAnswers + result.wrongAnswers;
    categoryMap.set(category, entry);
  }
  const byCategory = [...categoryMap.values()].map((item) => ({ ...item, accuracy: item.total === 0 ? 0 : Math.round((item.correct / item.total) * 100) }));
  const weakCategories = byCategory.filter((item) => item.attempts > 0).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  const totalAnswers = student.totalCorrectAnswers + student.totalWrongAnswers;
  res.json({
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      institution: student.institution?.name,
      level: student.level,
      xp: student.xp,
      coins: student.coins,
      streak: student.streak,
      bestStreak: student.bestStreak,
      totalQuizzes: student.totalQuizzes,
      totalCorrectAnswers: student.totalCorrectAnswers,
      totalWrongAnswers: student.totalWrongAnswers,
      accuracy: totalAnswers === 0 ? 0 : Math.round((student.totalCorrectAnswers / totalAnswers) * 100)
    },
    byCategory,
    weakCategories,
    recentResults: results.map((result) => ({
      id: result.id,
      quizTitle: result.quiz?.title ?? "Daily Challenge",
      score: result.score,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      xpGained: result.xpGained,
      completedAt: result.completedAt
    }))
  });
});

export const teacherReports = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const institutionId = (req.query.institutionId as string | undefined) ?? authReq.user?.institutionId;
  if (!institutionId) throw new AppError(400, "Institution id is required");
  if (authReq.user?.role !== Role.SUPER_ADMIN && institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");

  const [students, quizzes, recentResults] = await Promise.all([
    prisma.user.findMany({
      where: { institutionId, role: "STUDENT" },
      select: { id: true, fullName: true, email: true, level: true, xp: true, totalQuizzes: true, totalCorrectAnswers: true, totalWrongAnswers: true, streak: true },
      orderBy: [{ totalQuizzes: "desc" }, { xp: "desc" }],
      take: 20
    }),
    prisma.quiz.findMany({
      where: { OR: [{ institutionId }, { institutionId: null }] },
      include: { category: true, _count: { select: { questions: true, results: true } } },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.quizResult.findMany({
      where: { user: { institutionId } },
      include: { user: true, quiz: true },
      orderBy: { completedAt: "desc" },
      take: 20
    })
  ]);

  const studentsWithAccuracy = students.map((student) => {
    const total = student.totalCorrectAnswers + student.totalWrongAnswers;
    return { ...student, accuracy: total === 0 ? 0 : Math.round((student.totalCorrectAnswers / total) * 100) };
  });

  res.json({
    institutionId,
    classSummary: {
      students: students.length,
      quizzes: quizzes.length,
      averageAccuracy: studentsWithAccuracy.length === 0 ? 0 : Math.round(studentsWithAccuracy.reduce((sum, student) => sum + student.accuracy, 0) / studentsWithAccuracy.length),
      totalAttempts: students.reduce((sum, student) => sum + student.totalQuizzes, 0)
    },
    students: studentsWithAccuracy,
    quizzes,
    recentResults: recentResults.map((result) => ({
      id: result.id,
      studentName: result.user.fullName,
      quizTitle: result.quiz?.title ?? "Daily Challenge",
      score: result.score,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      completedAt: result.completedAt
    }))
  });
});
