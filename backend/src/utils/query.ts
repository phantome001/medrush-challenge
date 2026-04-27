import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  difficulty: z.string().trim().optional(),
  role: z.string().trim().optional(),
  institutionId: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  specialty: z.string().trim().optional(),
  paymentStatus: z.string().trim().optional(),
  isPremium: z.coerce.boolean().optional()
});

export const parseListQuery = (query: unknown) => {
  const parsed = querySchema.parse(query);
  return {
    ...parsed,
    skip: (parsed.page - 1) * parsed.pageSize,
    take: parsed.pageSize
  };
};
