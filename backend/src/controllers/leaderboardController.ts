import { Role } from "@prisma/client";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";

export const getLeaderboard = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const period = (req.query.period as "DAILY" | "WEEKLY" | "MONTHLY" | "INSTITUTION" | "GLOBAL" | undefined) ?? "GLOBAL";
  const users = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(period === "GLOBAL" && authReq.user?.role === Role.SUPER_ADMIN ? {} : { institutionId: authReq.user?.institutionId ?? "" })
    },
    select: { id: true, fullName: true, avatar: true, xp: true, level: true, institutionId: true, badges: { include: { badge: true }, take: 1 } },
    orderBy: { xp: "desc" },
    take: 50
  });
  res.json(users.map((user, index) => ({ rank: index + 1, ...user })));
});

export const resetLeaderboard = asyncHandler(async (_req, res) => {
  await prisma.leaderboard.deleteMany();
  res.json({ message: "Leaderboard reset" });
});

export const exportLeaderboard = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const users = await prisma.user.findMany({
    where: { role: "STUDENT", ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { institutionId: authReq.user?.institutionId ?? "" }) },
    select: { fullName: true, email: true, xp: true, level: true },
    orderBy: { xp: "desc" }
  });
  const csv = ["name,email,xp,level", ...users.map((user) => `${user.fullName},${user.email},${user.xp},${user.level}`)].join("\n");
  res.header("Content-Type", "text/csv").send(csv);
});
