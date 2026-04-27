# MedRush Challenge MVP Demo Scenario

Use this flow to present the MVP in 10-15 minutes.

## 1. Start the platform

```bash
docker compose up --build
```

Open:

- Admin dashboard: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/health`
- API docs: `http://localhost:4000/api/docs`

## 2. Super Admin demo

Login:

- Email: `admin@medrush.com`
- Password: `Admin123456`

Show:

1. Dashboard stats: institutions, users, active subscriptions, quizzes, questions, revenue placeholder.
2. Institutions page: create an institution, edit it, suspend it, and explain tenant isolation.
3. Users page: filter/search students and teachers, add a teacher/student, suspend an account safely.
4. Quizzes page: create/edit/archive/delete demo quizzes.
5. Questions page: create/edit/delete MCQ questions with explanations and premium/free flag.
6. Clinical cases page: create/edit/delete educational clinical vignettes.
7. Payments and subscription plans: show manual payment-ready workflow.
8. Reports: show active students, quiz activity, category performance.

## 3. Teacher / Institution demo

Login:

- Email: `teacher@medrush.com`
- Password: `Teacher123456`

Show that teachers can manage learning content for their own tenant but cannot access another institution's private data.

## 4. Student mobile app demo

Login:

- Email: `student@medrush.com`
- Password: `Student123456`

Show:

1. Home screen with level, XP, coins, streak, subscription status.
2. Daily Challenge: answer questions, see explanations, finish and view XP/coins result.
3. Quiz Categories: choose Anatomy/Pharmacology/etc.
4. Clinical Cases: read educational case with disclaimer, answer diagnosis-style question.
5. Leaderboard and Profile: XP ranking, achievements, stats.
6. Subscription screen: Free, Premium, Institution plan comparison.
7. Settings: switch Arabic/French/English, dark mode, offline demo mode.

## 5. Offline fallback demo

Stop the backend or disconnect API access, then start a quiz. The mobile app loads cached questions; if no cache exists, it displays bundled educational demo data.

## 6. Safety note

Mention clearly:

> This app is for educational purposes only. It does not provide medical diagnosis or treatment and does not replace professional medical advice.
