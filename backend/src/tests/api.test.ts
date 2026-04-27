import request from "supertest";
import { app } from "../app";
import { prisma } from "../database/prisma";

const login = async (email: string, password: string) => {
  const response = await request(app).post("/api/auth/login").send({ email, password });
  if (response.status !== 200) throw new Error(`Login failed for ${email}: ${response.text}`);
  return response.body.accessToken as string;
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

const run = async () => {
  const admin = await login("admin@medrush.com", "Admin123456");
  const teacher = await login("teacher@medrush.com", "Teacher123456");
  const student = await login("student@medrush.com", "Student123456");

  const noAuth = await request(app).get("/api/users");
  if (noAuth.status !== 401) throw new Error("Protected route did not require JWT");

  const studentUsers = await request(app).get("/api/users").set(auth(student));
  if (studentUsers.status !== 403) throw new Error("Student accessed user management");

  const quiz = await prisma.quiz.findFirstOrThrow({ where: { institutionId: { not: null } } });
  const otherTeacher = await prisma.user.findFirstOrThrow({ where: { role: "TEACHER", institutionId: { not: quiz.institutionId } } });
  const otherTeacherToken = await login(otherTeacher.email, "Teacher123456");
  const crossTenant = await request(app).patch(`/api/quizzes/${quiz.id}`).set(auth(otherTeacherToken)).send({ title: "Blocked cross-tenant update" });
  if (crossTenant.status !== 403) throw new Error("Cross-tenant quiz update was allowed");

  const createdQuiz = await request(app)
    .post("/api/quizzes")
    .set(auth(teacher))
    .send({
      title: "MVP Demo Safety Quiz",
      description: "Role permission test quiz",
      categoryId: quiz.categoryId,
      difficulty: "EASY",
      isPremium: false,
      timeLimit: 60,
      status: "PUBLISHED"
    });
  if (createdQuiz.status !== 201) throw new Error(`Teacher could not create quiz: ${createdQuiz.text}`);

  const badSubmission = await request(app).post("/api/quizzes/submit-result").set(auth(student)).send({ quizId: quiz.id, correctAnswers: 11, totalQuestions: 10 });
  if (badSubmission.status !== 400) throw new Error("Invalid quiz submission was accepted");

  const submission = await request(app).post("/api/quizzes/submit-result").set(auth(student)).send({ quizId: quiz.id, correctAnswers: 8, totalQuestions: 10 });
  if (submission.status !== 201 || submission.body.correctAnswers !== 8) throw new Error("Valid quiz submission failed");

  const premiumQuiz = await prisma.quiz.findFirst({ where: { isPremium: true, status: "PUBLISHED" } });
  const freeStudent = await prisma.user.findFirst({ where: { role: "STUDENT", subscriptionStatus: "FREE" } });
  if (premiumQuiz && freeStudent) {
    const freeToken = await login(freeStudent.email, "Student123456");
    const premiumAccess = await request(app).get(`/api/quizzes/${premiumQuiz.id}`).set(auth(freeToken));
    if (premiumAccess.status !== 402) throw new Error("Free student accessed premium quiz");
  }

  const adminReports = await request(app).get("/api/reports/platform").set(auth(admin));
  if (adminReports.status !== 200 || typeof adminReports.body.totalUsers !== "number") throw new Error("Super admin report failed");

  await request(app).delete(`/api/quizzes/${createdQuiz.body.id}`).set(auth(teacher));
  await prisma.$disconnect();
};

run()
  .then(() => {
    console.log("Backend MVP security tests passed");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
