import { Award, Brain, Target, TrendingUp } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface CategoryRow {
  id?: string;
  category: string;
  attempts: number;
  correct: number;
  total: number;
  accuracy: number;
}

interface RecentResult {
  id: string;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  xpGained: number;
  completedAt: string;
}

interface StudentAnalytics {
  student: {
    fullName: string;
    institution?: string;
    level: number;
    xp: number;
    coins: number;
    streak: number;
    totalQuizzes: number;
    accuracy: number;
  };
  byCategory: CategoryRow[];
  weakCategories: CategoryRow[];
  recentResults: RecentResult[];
}

export const StudentAnalyticsPage = () => {
  const { data, loading, error } = useAsync<StudentAnalytics>(() => endpoints.studentAnalytics(), []);
  const weakText = data?.weakCategories.length ? data.weakCategories.map((item) => `${item.category} (${item.accuracy}%)`).join(", ") : "No weak categories yet";

  return (
    <>
      <PageHeader title="Student Analytics" subtitle="Personal progress, weak categories, accuracy, XP, and recent quiz history." />
      {error ? <div className="card border-red-200 bg-red-50 text-red-700">{error}</div> : null}
      {loading ? <div className="card">Loading student analytics...</div> : (
        <div className="space-y-6">
          <div className="card">
            <p className="text-sm text-slate-500">Student</p>
            <h2 className="mt-1 text-2xl font-black">{data?.student.fullName ?? "Student"}</h2>
            <p className="text-sm text-slate-500">{data?.student.institution ?? "Institution"} • Weak focus: {weakText}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Level" value={data?.student.level ?? 1} icon={<Award />} />
            <StatCard title="XP" value={data?.student.xp ?? 0} icon={<TrendingUp />} />
            <StatCard title="Accuracy" value={`${data?.student.accuracy ?? 0}%`} icon={<Target />} />
            <StatCard title="Attempts" value={data?.student.totalQuizzes ?? 0} icon={<Brain />} />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-bold">Performance by category</h2>
            <DataTable rows={data?.byCategory ?? []} columns={[
              { key: "category", label: "Category" },
              { key: "attempts", label: "Attempts" },
              { key: "correct", label: "Correct" },
              { key: "total", label: "Total" },
              { key: "accuracy", label: "Accuracy", render: (row) => `${row.accuracy}%` }
            ]} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Recent results</h2>
            <DataTable rows={data?.recentResults ?? []} columns={[
              { key: "quizTitle", label: "Quiz" },
              { key: "score", label: "Score", render: (row) => `${row.score}%` },
              { key: "correctAnswers", label: "Correct" },
              { key: "wrongAnswers", label: "Wrong" },
              { key: "xpGained", label: "XP" },
              { key: "completedAt", label: "Completed", render: (row) => new Date(row.completedAt).toLocaleDateString() }
            ]} />
          </section>
        </div>
      )}
    </>
  );
};
