import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { parseListQuery } from "../utils/query";
import { assertCanManageInstitutionId, tenantScopedInstitutionId } from "../utils/tenant";

const schema = z.object({
  userId: z.string().optional().nullable(),
  institutionId: z.string().optional().nullable(),
  amount: z.number().min(0),
  method: z.string().min(2),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).default("PENDING"),
  transactionReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const listPayments = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const query = parseListQuery(req.query);
  const where = {
    ...(authReq.user?.role === Role.SUPER_ADMIN ? {} : { institutionId: authReq.user?.institutionId }),
    ...(query.institutionId && authReq.user?.role === Role.SUPER_ADMIN ? { institutionId: query.institutionId } : {}),
    ...(query.paymentStatus ? { status: query.paymentStatus as "PENDING" | "PAID" | "FAILED" | "REFUNDED" } : {}),
    ...(query.search ? { OR: [{ transactionReference: { contains: query.search, mode: "insensitive" as const } }, { notes: { contains: query.search, mode: "insensitive" as const } }] } : {})
  };
  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({ where, include: { user: true, institution: true }, orderBy: { createdAt: "desc" }, skip: query.skip, take: query.take }),
    prisma.payment.count({ where })
  ]);
  res.json({ data: payments, meta: { total, page: query.page, pageSize: query.pageSize } });
});

export const createPayment = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = schema.parse(req.body);
  const institutionId = tenantScopedInstitutionId(authReq.user, data.institutionId);
  if (data.userId) {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new AppError(404, "User not found");
    assertCanManageInstitutionId(authReq.user, user.institutionId);
  }
  res.status(201).json(await prisma.payment.create({ data: { ...data, institutionId } }));
});

export const updatePayment = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const existing = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "Payment not found");
  assertCanManageInstitutionId(authReq.user, existing.institutionId);
  const data = schema.partial().parse(req.body);
  const institutionId = data.institutionId !== undefined ? tenantScopedInstitutionId(authReq.user, data.institutionId) : undefined;
  res.json(await prisma.payment.update({ where: { id: req.params.id }, data: { ...data, institutionId } }));
});
