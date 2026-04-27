import { Quiz, Question, ClinicalCase, Role, SubscriptionStatus } from "@prisma/client";
import { AuthUser } from "../models/authenticatedRequest";

export const canAccessPremium = (user: AuthUser) =>
  user.role === Role.SUPER_ADMIN ||
  user.role === Role.INSTITUTION_ADMIN ||
  user.role === Role.TEACHER ||
  user.subscriptionStatus === SubscriptionStatus.ACTIVE ||
  Boolean(user.institutionId && user.subscriptionStatus !== SubscriptionStatus.EXPIRED);

export const visibleQuizWhere = (user: AuthUser) => ({
  status: "PUBLISHED" as const,
  OR: [{ institutionId: null }, { institutionId: user.institutionId }],
  ...(canAccessPremium(user) ? {} : { isPremium: false })
});

export const filterPremiumItems = <T extends Quiz | Question | ClinicalCase>(items: T[], user: AuthUser) =>
  canAccessPremium(user) ? items : items.filter((item) => !item.isPremium);
