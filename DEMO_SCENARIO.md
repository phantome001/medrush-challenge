# MedRush Challenge MVP Demo Scenario

Use this flow to present the MVP in 10-15 minutes.

## 1. Start the platform

```bash
docker compose up --build
```

Open:

- Admin dashboard: `http://localhost:5173`
- Landing page: `http://localhost:5173/landing`
- Backend health: `http://localhost:4000/api/health`
- API docs: `http://localhost:4000/api/docs`

## 2. Super Admin demo

Login:

- Email: `admin@medrush.com`
- Password: `Admin123456`

Show:

1. Landing page: present the product story and click into admin login.
2. Dashboard stats: institutions, users, active subscriptions, quizzes, questions, revenue placeholder.
3. Institutions page: create an institution, edit it, suspend it, and explain tenant isolation.
4. Users page: filter/search students and teachers, add a teacher/student, suspend an account safely.
5. Quizzes page: create/edit/archive/delete demo quizzes.
6. Questions page: create/edit/delete MCQ questions, upload an image, add explanations, and set premium/free flag.
7. Clinical cases page: create/edit/delete educational clinical vignettes.
8. Payments and subscription plans: show manual records and Stripe-ready checkout demo.
9. Teacher Reports: show class summary, student accuracy, and recent attempts.
10. Student Analytics: show weak categories and individual performance.

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
6. Analytics screen: show weak categories and recent performance.
7. Subscription screen: Free/Premium/Institution plans with checkout-ready action.
8. Settings: switch Arabic/French/English, dark mode, offline demo mode.

## 5. Offline fallback demo

Stop the backend or disconnect API access, then start a quiz. The mobile app loads cached questions; if no cache exists, it displays bundled educational demo data.

## 6. Safety note

Mention clearly:

> This app is for educational purposes only. It does not provide medical diagnosis or treatment and does not replace professional medical advice.
