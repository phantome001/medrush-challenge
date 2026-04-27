import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface LeaderboardRow {
  id: string;
  rank: number;
  fullName: string;
  xp: number;
  level: number;
}

export const LeaderboardPage = () => {
  const [period, setPeriod] = useState("GLOBAL");
  const { data, loading } = useAsync<LeaderboardRow[]>(() => endpoints.leaderboard(period), [period]);
  return (
    <>
      <PageHeader title="Leaderboard Management" subtitle="View global and institution rankings, export results, or reset leaderboard." action={<a className="btn-secondary" href={`${import.meta.env.VITE_API_URL}/leaderboard/export`}>Export CSV</a>} />
      <div className="mb-4 flex gap-2">
        {["DAILY", "WEEKLY", "MONTHLY", "INSTITUTION", "GLOBAL"].map((tab) => <button key={tab} className={tab === period ? "btn" : "btn-secondary"} onClick={() => setPeriod(tab)}>{tab}</button>)}
      </div>
      {loading ? <div className="card">Loading leaderboard...</div> : <DataTable rows={data ?? []} columns={[
        { key: "rank", label: "Rank" },
        { key: "fullName", label: "Name" },
        { key: "xp", label: "XP" },
        { key: "level", label: "Level" }
      ]} />}
    </>
  );
};
