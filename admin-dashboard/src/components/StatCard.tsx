import { ReactNode } from "react";

export const StatCard = ({ title, value, icon }: { title: string; value: ReactNode; icon?: ReactNode }) => (
  <div className="card flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
    <div className="rounded-2xl bg-blue-50 p-3 text-medblue">{icon}</div>
  </div>
);
