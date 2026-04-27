# MedRush Challenge

MedRush Challenge is a SaaS mobile educational medical game platform for medical, pharmacy, nursing, dentistry, and health science students.

## Applications

- `backend/` — Express + Prisma + PostgreSQL REST API.
- `admin-dashboard/` — React + Tailwind SaaS dashboard.
- `mobile-app/` — Flutter Android/iOS app.

See `ARCHITECTURE.md` for the full design.

## Demo accounts

Seed data creates:

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@medrush.com` | `Admin123456` |
| Teacher | `teacher@medrush.com` | `Teacher123456` |
| Student | `student@medrush.com` | `Student123456` |

## Run everything with Docker

```bash
docker compose up --build
```

Then open:

- Backend API: `http://localhost:4000/api/health`
- API docs: `http://localhost:4000/api/docs`
- Admin dashboard: `http://localhost:5173`
- Public landing page: `http://localhost:5173/landing`

Docker startup runs Prisma schema sync and seed data automatically for the demo.

## Run backend locally

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run db:deploy
npm run seed
npm run dev
```

Run backend tests:

```bash
cd backend
npm test
```

The tests cover JWT protection, role permissions, quiz submission validation, premium subscription access, and multi-tenant isolation.

## Run admin dashboard locally

```bash
cd admin-dashboard
cp .env.example .env
npm install
npm run dev
```

Admin local URL: `http://localhost:5173`

## Run Flutter app locally

Install Flutter first, then:

```bash
cd mobile-app
flutter pub get
flutter run
```

For Android emulator, set API URL in `lib/core/constants.dart` to `http://10.0.2.2:4000/api`.
For iOS simulator, use `http://localhost:4000/api`.

The mobile app includes offline fallbacks for quizzes and clinical cases. When the API is unavailable, cached quizzes are loaded from `SharedPreferences`; if no cache exists, bundled educational demo data is shown.

## Seed database

```bash
cd backend
npm run db:deploy
npm run seed
```

Seed data resets demo tables and creates realistic medical questions, clinical cases, institutions, users, subscription plans, payments, notifications, badges, and leaderboard-ready stats.

## Main feature coverage

- Multi-tenant institutions with plans, quotas, status, branding, and institution codes.
- JWT auth, refresh tokens, secure password hashing, RBAC, and tenant-scoped access.
- Student mobile gameplay: onboarding, auth, home, daily challenge, quiz categories, quiz runner, clinical cases, anatomy, first aid, leaderboard, profile, badges, store, subscriptions, notifications, settings, RTL language support, result sharing copy, and offline mode.
- Admin dashboard: login, super admin stats, institutions, users, teachers, students, quizzes, questions, clinical cases, categories, leaderboards, plans, payments, reports, settings, notifications, modals, search, tables, exports, and row actions.
- Marketing landing page at `/landing` for presenting the product before logging into the admin dashboard.
- Teacher reports with class summary, student accuracy, recent attempts, and quiz engagement.
- Student analytics with weak categories, category accuracy, recent results, XP, streaks, and level progress.
- Local secure image upload for educational question images, exposed through `/uploads`.
- Stripe-ready checkout endpoint that returns demo checkout links until real `STRIPE_SECRET_KEY` is configured.
- GitHub Actions CI for backend schema/build/tests and admin dashboard build.
- Seed data: 1 super admin, 2 institutions, 3 teachers, 20 students, 11 categories, 10 quizzes, 100 questions, 30 clinical cases, 10 badges, and 3 subscription plans.

## Security and MVP stability

- Protected API routes require JWT access tokens.
- Role-based access control separates Super Admin, Institution Admin, Teacher, and Student capabilities.
- Institution admins and teachers are tenant-scoped to their own institution.
- Students cannot access admin management endpoints.
- Premium quizzes and clinical cases return `402 Premium subscription required` for free students.
- Create/update inputs use Zod validation and return clear validation errors.
- List endpoints support pagination, search, and filters for demo-scale operations.
- Delete actions are guarded when records have dependent users, quizzes, results, or category content.

## Demo assets

- `DEMO_SCENARIO.md` explains how to present the MVP.
- `screenshots-mockups/` contains admin screenshots and mobile mockups.

## Optional Stripe-ready payment setup

The MVP works without Stripe keys and returns demo checkout URLs. For real Stripe checkout sessions, set:

```bash
STRIPE_SECRET_KEY="sk_live_or_test_key"
STRIPE_WEBHOOK_SECRET="whsec_optional_for_webhooks"
STRIPE_SUCCESS_URL="https://your-admin-domain.com/payments?payment=success"
STRIPE_CANCEL_URL="https://your-admin-domain.com/payments?payment=cancelled"
```

Then call `POST /api/payments/checkout` with a `planId`.

## Build Android APK

```bash
cd mobile-app
flutter pub get
flutter build apk --release
```

The APK will be generated at `build/app/outputs/flutter-apk/app-release.apk`.

## Prepare iOS build

```bash
cd mobile-app
flutter pub get
flutter build ios --release
```

Open `ios/Runner.xcworkspace` in Xcode, configure signing, then archive/upload.

## Deployment later

1. Use managed PostgreSQL and set `DATABASE_URL`.
2. Deploy `backend/` Docker image to Fly.io, Render, Railway, ECS, or Kubernetes.
3. Deploy `admin-dashboard/` with `VITE_API_URL` pointing to the production API.
4. Build mobile binaries with production API URL and submit to Google Play/App Store.
5. Add production Stripe webhook handling or connect PayPal/local payment provider behind the existing payment and subscription tables.

## Production hardening checklist

- Replace JWT secrets and database passwords.
- Configure HTTPS, reverse proxy, and production CORS origins.
- Move media uploads to S3/GCS or another object store.
- Add a real email provider for verification and password reset.
- Configure Stripe webhook signature verification and provider webhooks for paid status updates.
- Run `npx prisma migrate dev --name init` against a clean development database to generate a full production migration history before launch.

## Known limitations

- Stripe checkout is integration-ready and creates real sessions when `STRIPE_SECRET_KEY` is set, but production webhooks are not enabled yet.
- Local image uploads are suitable for demo/local use; production should use object storage.
- Email verification and password reset return provider-ready responses until an email service is configured.
- Mobile screenshots in `screenshots-mockups/` are mockups because Flutter SDK/emulator is unavailable in this environment.
- Media upload fields currently accept URLs/placeholders; production should connect object storage.

## Medical disclaimer

This application is for educational purposes only. It does not provide medical diagnosis or treatment and does not replace professional medical advice.
