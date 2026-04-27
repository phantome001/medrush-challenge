export const calculateLevel = (xp: number) => {
  if (xp < 500) return 1;
  if (xp < 1200) return 2;
  if (xp < 2500) return 3;
  if (xp < 5000) return 4;
  let level = 5;
  while (xp >= level * level * 500) {
    level += 1;
  }
  return level - 1;
};

export const calculateRewards = (correctAnswers: number, totalQuestions: number, isDailyChallenge = false) => {
  const wrongAnswers = Math.max(totalQuestions - correctAnswers, 0);
  const perfect = totalQuestions > 0 && correctAnswers === totalQuestions;
  const xpGained = correctAnswers * 10 + 50 + (isDailyChallenge ? 100 : 0) + (perfect ? 150 : 0);
  const coinsGained = correctAnswers * 2 + (isDailyChallenge ? 20 : 0);

  return { wrongAnswers, xpGained, coinsGained, perfect };
};

export const isSameUtcDate = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

export const isYesterdayUtc = (date: Date, now: Date) => {
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  return isSameUtcDate(date, yesterday);
};
