import { z } from "zod";
import { Role } from "@prisma/client";
import Stripe from "stripe";
import { env } from "../config/env";
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

const checkoutSchema = z.object({
  planId: z.string(),
  institutionId: z.string().optional().nullable()
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

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const data = checkoutSchema.parse(req.body);
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: data.planId } });
  if (!plan || !plan.isActive) throw new AppError(404, "Subscription plan not found");

  const institutionId = tenantScopedInstitutionId(authReq.user, data.institutionId ?? authReq.user?.institutionId ?? null);
  const payment = await prisma.payment.create({
    data: {
      userId: authReq.user?.id,
      institutionId,
      amount: plan.price,
      method: env.STRIPE_SECRET_KEY ? "STRIPE" : "DEMO_STRIPE",
      status: "PENDING",
      notes: `Checkout for ${plan.name}`
    }
  });

  if (!env.STRIPE_SECRET_KEY) {
    res.status(201).json({
      mode: "demo",
      paymentId: payment.id,
      checkoutUrl: `${env.STRIPE_SUCCESS_URL}&paymentId=${payment.id}`,
      message: "Stripe is ready. Add STRIPE_SECRET_KEY to create real checkout sessions."
    });
    return;
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${env.STRIPE_SUCCESS_URL}&paymentId=${payment.id}`,
    cancel_url: `${env.STRIPE_CANCEL_URL}&paymentId=${payment.id}`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(plan.price) * 100),
          product_data: { name: `MedRush ${plan.name}`, description: `${plan.durationDays} days subscription` }
        },
        quantity: 1
      }
    ],
    metadata: { paymentId: payment.id, planId: plan.id, institutionId: institutionId ?? "" }
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { transactionReference: session.id } });
  res.status(201).json({ mode: "stripe", paymentId: payment.id, sessionId: session.id, checkoutUrl: session.url });
});

export const confirmDemoPayment = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) throw new AppError(404, "Payment not found");
  assertCanManageInstitutionId(authReq.user, payment.institutionId);
  res.json(await prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID", transactionReference: payment.transactionReference ?? `demo-${Date.now()}` } }));
});
