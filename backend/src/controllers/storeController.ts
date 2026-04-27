import { prisma } from "../database/prisma";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const storeItems = [
  { id: "premium-anatomy-pack", name: "Premium Anatomy Pack", type: "QUIZ_PACK", cost: 250 },
  { id: "blue-avatar-frame", name: "Blue Avatar Frame", type: "AVATAR_FRAME", cost: 100 },
  { id: "midnight-theme", name: "Midnight Theme", type: "THEME", cost: 150 },
  { id: "gold-badge-style", name: "Gold Badge Style", type: "BADGE_STYLE", cost: 200 }
];

export const listStoreItems = asyncHandler(async (_req, res) => {
  res.json(storeItems);
});

export const unlockStoreItem = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const item = storeItems.find((storeItem) => storeItem.id === req.params.id);
  if (!item) throw new AppError(404, "Store item not found");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authReq.user?.id } });
  if (user.coins < item.cost) throw new AppError(400, "Not enough coins");
  await prisma.user.update({ where: { id: user.id }, data: { coins: { decrement: item.cost } } });
  res.json({ message: "Item unlocked", item });
});
