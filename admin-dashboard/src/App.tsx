import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ClinicalCasesPage } from "./pages/ClinicalCasesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InstitutionsPage } from "./pages/InstitutionsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { PlansPage } from "./pages/PlansPage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { QuizManagementPage } from "./pages/QuizManagementPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudentAnalyticsPage } from "./pages/StudentAnalyticsPage";
import { TeacherReportsPage } from "./pages/TeacherReportsPage";
import { UsersPage } from "./pages/UsersPage";
import { isAuthenticated } from "./utils/auth";

const Protected = () => (isAuthenticated() ? <DashboardLayout /> : <Navigate to="/login" replace />);

export const App = () => (
  <Routes>
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route element={<Protected />}>
      <Route index element={<DashboardPage />} />
      <Route path="/institutions" element={<InstitutionsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/teachers" element={<UsersPage roleFilter="TEACHER" title="Teachers Management" />} />
      <Route path="/students" element={<UsersPage roleFilter="STUDENT" title="Students Management" />} />
      <Route path="/quizzes" element={<QuizManagementPage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/clinical-cases" element={<ClinicalCasesPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/teacher-reports" element={<TeacherReportsPage />} />
      <Route path="/student-analytics" element={<StudentAnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
    </Route>
  </Routes>
);
