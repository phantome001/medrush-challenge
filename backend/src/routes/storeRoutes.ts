import { Router } from "express";
import * as controller from "../controllers/storeController";
import { requireAuth } from "../middlewares/auth";

export const storeRoutes = Router();

storeRoutes.use(requireAuth);
storeRoutes.get("/", controller.listStoreItems);
storeRoutes.post("/:id/unlock", controller.unlockStoreItem);
