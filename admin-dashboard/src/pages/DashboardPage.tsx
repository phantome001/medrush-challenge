import { Activity, BookOpen, Building2, CreditCard, FileQuestion, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "../components/StatCard";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

export const DashboardPage = () => {
  const { data, loading } = useAsync<Record<string, number>>(() => endpoints.stats(), []);
  const chartData = [
    { month: "Jan", users: 30 },
    { month: "Feb", users: 55 },
    { month: "Mar", users: 82 },
    { month: "Apr", users: data?.totalUsers ?? 0 }
  ];

  if (loading) return <div className="card">Loading dashboard...</div>;

  return (
    <>
      <PageHeader title="Super Admin Dashboard" subtitle="Platform-wide SaaS health and educational activity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total institutions" value={data?.totalInstitutions ?? 0} icon={<Building2 />} />
        <StatCard title="Total users" value={data?.totalUsers ?? 0} icon={<Users />} />
        <StatCard title="Active subscriptions" value={data?.activeSubscriptions ?? 0} icon={<Activity />} />
        <StatCard title="Expired subscriptions" value={data?.expiredSubscriptions ?? 0} icon={<CreditCard />} />
        <StatCard title="Total quizzes" value={data?.totalQuizzes ?? 0} icon={<BookOpen />} />
        <StatCard title="Total questions" value={data?.totalQuestions ?? 0} icon={<FileQuestion />} />
        <StatCard title="Revenue placeholder" value={`$${data?.revenue ?? 0}`} icon={<CreditCard />} />
      </div>
      <div className="card mt-6 h-96">
        <h2 className="mb-4 text-lg font-bold">Monthly growth</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};
