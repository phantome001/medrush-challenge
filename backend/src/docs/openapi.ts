export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "MedRush Challenge API",
    version: "1.0.0",
    description:
      "REST API for a multi-tenant educational medical game platform. Educational use only; not medical advice."
  },
  servers: [{ url: "http://localhost:4000/api" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/health": { get: { summary: "Health check", responses: { "200": { description: "OK" } } } },
    "/auth/register": { post: { summary: "Register student" } },
    "/auth/login": { post: { summary: "Login" } },
    "/auth/refresh": { post: { summary: "Refresh token" } },
    "/auth/logout": { post: { summary: "Logout" } },
    "/auth/me": { get: { summary: "Current user" } },
    "/institutions": { get: { summary: "List institutions" }, post: { summary: "Create institution" } },
    "/users": { get: { summary: "List users" }, post: { summary: "Create user" } },
    "/categories": { get: { summary: "List categories" }, post: { summary: "Create category" } },
    "/quizzes": { get: { summary: "List quizzes" }, post: { summary: "Create quiz" } },
    "/quizzes/daily-challenge": { get: { summary: "Get 10 random daily questions" } },
    "/quizzes/submit-result": { post: { summary: "Submit quiz result and award XP/coins/badges" } },
    "/questions": { get: { summary: "List questions" }, post: { summary: "Create question" } },
    "/questions/random": { get: { summary: "Get random questions" } },
    "/clinical-cases": { get: { summary: "List clinical cases" }, post: { summary: "Create clinical case" } },
    "/leaderboard": { get: { summary: "Get leaderboard" } },
    "/subscriptions/plans": { get: { summary: "List subscription plans" }, post: { summary: "Create subscription plan" } },
    "/payments": { get: { summary: "List manual payments" }, post: { summary: "Create manual payment" } },
    "/reports/platform": { get: { summary: "Platform statistics" } },
    "/notifications": { get: { summary: "User notifications" }, post: { summary: "Create notification" } },
    "/store": { get: { summary: "Store items" } }
  }
};
