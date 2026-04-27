import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const planSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  durationDays: z.number().int().min(1),
  maxStudents: z.number().int().min(0),
  maxTeachers: z.number().int().min(0),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

export const listPlans = asyncHandler(async (_req, res) => {
  res.json(await prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } }));
});

export const createPlan = asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.subscriptionPlan.create({ data: planSchema.parse(req.body) }));
});

export const updatePlan = asyncHandler(async (req, res) => {
  res.json(await prisma.subscriptionPlan.update({ where: { id: req.params.id }, data: planSchema.partial().parse(req.body) }));
});

export const assignPlan = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = z
    .object({
      institutionId: z.string(),
      planId: z.string(),
      subscriptionStart: z.string().datetime(),
      subscriptionEnd: z.string().datetime()
    })
    .parse(req.body);
  if (authReq.user?.role !== Role.SUPER_ADMIN && data.institutionId !== authReq.user?.institutionId) throw new AppError(403, "Tenant access denied");
  res.json(
    await prisma.institution.update({
      where: { id: data.institutionId },
      data: {
        subscriptionPlanId: data.planId,
        subscriptionStart: new Date(data.subscriptionStart),
        subscriptionEnd: new Date(data.subscriptionEnd),
        status: "ACTIVE"
      }
    })
  );
});

export const checkStatus = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const institution = authReq.user?.institutionId ? await prisma.institution.findUnique({ where: { id: authReq.user.institutionId }, include: { subscriptionPlan: true } }) : null;
  const expired = institution?.subscriptionEnd ? institution.subscriptionEnd < new Date() : false;
  res.json({ userSubscriptionStatus: authReq.user?.subscriptionStatus, institution, expired });
});

export const expireSubscriptions = asyncHandler(async (_req, res) => {
  const result = await prisma.institution.updateMany({
    where: { subscriptionEnd: { lt: new Date() }, status: "ACTIVE" },
    data: { status: "EXPIRED" }
  });
  res.json(result);
});

export const deletePlan = asyncHandler(async (req, res) => {
  const inUse = await prisma.institution.count({ where: { subscriptionPlanId: req.params.id } });
  if (inUse > 0) throw new AppError(409, "Cannot delete a plan assigned to institutions. Deactivate it instead.");
  await prisma.subscriptionPlan.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
