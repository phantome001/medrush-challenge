import { z } from "zod";
import { prisma } from "../database/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().default("#2563eb"),
  isActive: z.boolean().default(true)
});

export const listCategories = asyncHandler(async (_req, res) => {
  res.json(await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { questions: true, quizzes: true } } } }));
});

export const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.category.create({ data: schema.parse(req.body) }));
});

export const updateCategory = asyncHandler(async (req, res) => {
  res.json(await prisma.category.update({ where: { id: req.params.id }, data: schema.partial().parse(req.body) }));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id }, include: { _count: { select: { questions: true, quizzes: true } } } });
  if (!category) throw new AppError(404, "Category not found");
  if (category._count.questions > 0 || category._count.quizzes > 0) throw new AppError(409, "Cannot delete a category with questions or quizzes. Deactivate it instead.");
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
