import { prisma } from "../database/prisma";
import { calculateLevel, calculateRewards, isSameUtcDate, isYesterdayUtc } from "../utils/gamification";

export const applyQuizResult = async (userId: string, quizId: string | null, correctAnswers: number, totalQuestions: number, isDailyChallenge = false) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const rewards = calculateRewards(correctAnswers, totalQuestions, isDailyChallenge);
  const now = new Date();

  let streak = user.streak;
  if (!user.lastActivityDate || !isSameUtcDate(user.lastActivityDate, now)) {
    streak = user.lastActivityDate && isYesterdayUtc(user.lastActivityDate, now) ? user.streak + 1 : 1;
  }

  const bonusCoins = isDailyChallenge && streak === 7 ? 100 : 0;
  const xp = user.xp + rewards.xpGained;
  const coins = user.coins + rewards.coinsGained + bonusCoins;
  const level = calculateLevel(xp);

  const result = await prisma.quizResult.create({
    data: {
      userId,
      quizId,
      score: correctAnswers,
      correctAnswers,
      wrongAnswers: rewards.wrongAnswers,
      xpGained: rewards.xpGained,
      coinsGained: rewards.coinsGained + bonusCoins
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp,
      coins,
      level,
      streak,
      bestStreak: Math.max(user.bestStreak, streak),
      lastActivityDate: now,
      totalCorrectAnswers: { increment: correctAnswers },
      totalWrongAnswers: { increment: rewards.wrongAnswers },
      totalQuizzes: { increment: 1 }
    }
  });

  await awardBadges(userId);
  await updateLeaderboards(userId);
  return result;
};

export const awardBadges = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const badges = await prisma.badge.findMany();
  const earned = await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } });
  const earnedIds = new Set(earned.map((item) => item.badgeId));

  const qualifies = (condition: string) => {
    if (condition === "first_quiz") return user.totalQuizzes >= 0;
    if (condition === "ten_quizzes") return user.totalQuizzes >= 9;
    if (condition === "hundred_correct") return user.totalCorrectAnswers >= 100;
    if (condition === "seven_streak") return user.streak >= 7;
    if (condition === "thirty_streak") return user.streak >= 30;
    if (condition === "anatomy_master") return user.totalCorrectAnswers >= 50;
    if (condition === "clinical_thinker") return user.totalQuizzes >= 5;
    if (condition === "first_aid_hero") return user.totalCorrectAnswers >= 25;
    return false;
  };

  for (const badge of badges) {
    if (!earnedIds.has(badge.id) && qualifies(badge.condition)) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      await prisma.notification.create({
        data: {
          userId,
          title: "New badge earned",
          message: `You earned the ${badge.name} badge.`,
          type: "BADGE"
        }
      });
    }
  }
};

export const updateLeaderboards = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const periods = ["DAILY", "WEEKLY", "MONTHLY", "GLOBAL"] as const;

  for (const period of periods) {
    await prisma.leaderboard.create({
      data: {
        userId,
        institutionId: user.institutionId,
        score: user.xp,
        period,
        rank: 0
      }
    });
  }
};
