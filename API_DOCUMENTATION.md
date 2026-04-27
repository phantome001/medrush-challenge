# MedRush Challenge API Documentation

Base URL: `http://localhost:4000/api`

OpenAPI UI: `http://localhost:4000/api/docs`

Use `Authorization: Bearer <accessToken>` for protected endpoints.

## Auth

- `POST /auth/register` — student registration with institution code.
- `POST /auth/login` — email/password login.
- `POST /auth/refresh` — refresh JWT.
- `POST /auth/logout` — revoke refresh token.
- `POST /auth/forgot-password` — email-provider-ready placeholder.
- `POST /auth/reset-password` — reset-provider-ready placeholder.
- `GET /auth/me` — current user.

## Users

- `GET /users` — list users with optional `role`, `search`, `institutionId`.
- `POST /users` — create user.
- `GET /users/:id` — user detail.
- `PATCH /users/:id` — update user.
- `DELETE /users/:id` — delete user.
- `POST /users/:id/suspend` — suspend user.
- `POST /users/:id/reset-password` — admin password reset.
- `PATCH /users/profile` — update own profile.

## Institutions

- `GET /institutions`
- `POST /institutions`
- `GET /institutions/:id`
- `PATCH /institutions/:id`
- `DELETE /institutions/:id`
- `POST /institutions/:id/suspend`
- `POST /institutions/:id/regenerate-code`
- `POST /institutions/join`

## Quizzes

- `GET /quizzes`
- `GET /quizzes/:id`
- `POST /quizzes`
- `PATCH /quizzes/:id`
- `DELETE /quizzes/:id`
- `GET /quizzes/daily-challenge`
- `GET /quizzes/premium`
- `POST /quizzes/submit-result`

Submit result payload:

```json
{
  "quizId": "optional",
  "correctAnswers": 8,
  "totalQuestions": 10,
  "isDailyChallenge": true
}
```

## Questions

- `GET /questions?categoryId=&difficulty=`
- `GET /questions/random?count=10`
- `POST /questions`
- `PATCH /questions/:id`
- `DELETE /questions/:id`

## Clinical cases

- `GET /clinical-cases?specialty=`
- `GET /clinical-cases/:id`
- `POST /clinical-cases`
- `PATCH /clinical-cases/:id`
- `DELETE /clinical-cases/:id`
- `POST /clinical-cases/:id/submit`

## Gamification

Gamification runs when quiz results are submitted:

- Correct answer: +10 XP
- Quiz completion: +50 XP
- Daily challenge completion: +100 XP
- Perfect score: +150 XP
- Correct answer: +2 coins
- Daily challenge completion: +20 coins
- 7-day streak: +100 coins

## Leaderboard

- `GET /leaderboard?period=DAILY|WEEKLY|MONTHLY|INSTITUTION|GLOBAL`
- `GET /leaderboard/export`
- `POST /leaderboard/reset`

## Subscriptions

- `GET /subscriptions/plans`
- `POST /subscriptions/plans`
- `PATCH /subscriptions/plans/:id`
- `POST /subscriptions/assign`
- `GET /subscriptions/status`
- `POST /subscriptions/expire`

## Payments

- `GET /payments`
- `POST /payments`
- `PATCH /payments/:id`
- `POST /payments/checkout` — Stripe-ready checkout; returns demo URL if Stripe key is not configured.
- `POST /payments/:id/confirm-demo` — mark demo/manual payment as paid.

Checkout payload:

```json
{
  "planId": "subscription_plan_id",
  "institutionId": "optional_for_super_admin"
}
```

## Reports

- `GET /reports/platform`
- `GET /reports/institution`
- `GET /reports/quizzes`
- `GET /reports/performance`
- `GET /reports/teacher`
- `GET /reports/student-analytics`

## Uploads

- `POST /uploads/image` — multipart `image` upload for JPG, PNG, WEBP, or GIF up to 2MB.
- `DELETE /uploads/:fileName` — delete a local uploaded demo image.

## Notifications

- `GET /notifications`
- `POST /notifications`
- `PATCH /notifications/:id/read`

## Store

- `GET /store`
- `POST /store/:id/unlock`
