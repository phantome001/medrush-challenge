import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface StudentReport {
  id: string;
  fullName: string;
  email?: string;
  xp?: number;
  level?: number;
  totalCorrectAnswers?: number;
  totalQuizzes?: number;
  streak?: number;
}

export const ReportsPage = () => {
  const { data, loading } = useAsync<{ bestStudents: StudentReport[]; activeStudents: StudentReport[] }>(() => endpoints.performance(), []);
  return (
    <>
      <PageHeader title="Reports" subtitle="Active students, performance analytics, most played quizzes, difficult questions, and category averages." />
      {loading ? <div className="card">Loading reports...</div> : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section>
            <h2 className="mb-3 text-lg font-bold">Best performing students</h2>
            <DataTable rows={data?.bestStudents ?? []} columns={[
              { key: "fullName", label: "Name" },
              { key: "email", label: "Email" },
              { key: "xp", label: "XP" },
              { key: "level", label: "Level" },
              { key: "totalCorrectAnswers", label: "Correct" }
            ]} />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">Most active students</h2>
            <DataTable rows={data?.activeStudents ?? []} columns={[
              { key: "fullName", label: "Name" },
              { key: "totalQuizzes", label: "Quizzes" },
              { key: "streak", label: "Streak" }
            ]} />
          </section>
        </div>
      )}
    </>
  );
};
