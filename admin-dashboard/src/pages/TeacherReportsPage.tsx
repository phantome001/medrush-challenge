import { Activity, BarChart3, GraduationCap, Percent } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface StudentRow {
  id: string;
  fullName: string;
  email: string;
  level: number;
  xp: number;
  totalQuizzes: number;
  accuracy: number;
  streak: number;
}

interface ResultRow {
  id: string;
  studentName: string;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  completedAt: string;
}

interface TeacherReport {
  classSummary: { students: number; quizzes: number; averageAccuracy: number; totalAttempts: number };
  students: StudentRow[];
  recentResults: ResultRow[];
}

export const TeacherReportsPage = () => {
  const { data, loading, error } = useAsync<TeacherReport>(() => endpoints.teacherReport(), []);

  return (
    <>
      <PageHeader title="Teacher Reports" subtitle="Class performance, student activity, accuracy, and recent quiz attempts." />
      {error ? <div className="card border-red-200 bg-red-50 text-red-700">{error}</div> : null}
      {loading ? <div className="card">Loading teacher reports...</div> : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Students" value={data?.classSummary.students ?? 0} icon={<GraduationCap />} />
            <StatCard title="Quizzes" value={data?.classSummary.quizzes ?? 0} icon={<BarChart3 />} />
            <StatCard title="Average accuracy" value={`${data?.classSummary.averageAccuracy ?? 0}%`} icon={<Percent />} />
            <StatCard title="Total attempts" value={data?.classSummary.totalAttempts ?? 0} icon={<Activity />} />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-bold">Student performance</h2>
            <DataTable rows={data?.students ?? []} columns={[
              { key: "fullName", label: "Name" },
              { key: "email", label: "Email" },
              { key: "level", label: "Level" },
              { key: "xp", label: "XP" },
              { key: "totalQuizzes", label: "Attempts" },
              { key: "accuracy", label: "Accuracy", render: (row) => `${row.accuracy}%` },
              { key: "streak", label: "Streak" }
            ]} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Recent attempts</h2>
            <DataTable rows={data?.recentResults ?? []} columns={[
              { key: "studentName", label: "Student" },
              { key: "quizTitle", label: "Quiz" },
              { key: "score", label: "Score", render: (row) => `${row.score}%` },
              { key: "correctAnswers", label: "Correct" },
              { key: "wrongAnswers", label: "Wrong" },
              { key: "completedAt", label: "Completed", render: (row) => new Date(row.completedAt).toLocaleDateString() }
            ]} />
          </section>
        </div>
      )}
    </>
  );
};
