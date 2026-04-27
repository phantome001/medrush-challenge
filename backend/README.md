# MedRush Backend

Express + Prisma + PostgreSQL API for MedRush Challenge.

## Local setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

## API

- Health: `GET /api/health`
- Docs: `GET /api/docs`
- Auth: `/api/auth`
- Admin/mobile resources: `/api/users`, `/api/institutions`, `/api/quizzes`, `/api/questions`, `/api/clinical-cases`, `/api/categories`, `/api/leaderboard`, `/api/subscriptions`, `/api/payments`, `/api/reports`, `/api/notifications`

## Safety disclaimer

This application is for educational purposes only. It does not provide medical diagnosis or treatment and does not replace professional medical advice.
