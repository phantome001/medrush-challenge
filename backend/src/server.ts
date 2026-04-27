import { env } from "./config/env";
import { prisma } from "./database/prisma";
import { app } from "./app";

const server = app.listen(env.PORT, () => {
  console.log(`MedRush API running on port ${env.PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
