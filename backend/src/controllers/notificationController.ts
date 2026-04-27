import { z } from "zod";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";

const schema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["DAILY_CHALLENGE", "NEW_QUIZ", "SUBSCRIPTION", "BADGE", "SYSTEM"]).default("SYSTEM")
});

export const listNotifications = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  res.json(await prisma.notification.findMany({ where: { userId: authReq.user?.id }, orderBy: { createdAt: "desc" } }));
});

export const createNotification = asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.notification.create({ data: schema.parse(req.body) }));
});

export const markRead = asyncHandler(async (req, res) => {
  res.json(await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } }));
});
