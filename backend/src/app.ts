import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { openApiDocument } from "./docs/openapi";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";
import { clinicalCaseRoutes } from "./routes/clinicalCaseRoutes";
import { institutionRoutes } from "./routes/institutionRoutes";
import { leaderboardRoutes } from "./routes/leaderboardRoutes";
import { notificationRoutes } from "./routes/notificationRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { questionRoutes } from "./routes/questionRoutes";
import { quizRoutes } from "./routes/quizRoutes";
import { reportRoutes } from "./routes/reportRoutes";
import { storeRoutes } from "./routes/storeRoutes";
import { subscriptionRoutes } from "./routes/subscriptionRoutes";
import { uploadRoutes } from "./routes/uploadRoutes";
import { userRoutes } from "./routes/userRoutes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(","), credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 300 }));
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "MedRush Challenge API" });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/clinical-cases", clinicalCaseRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
