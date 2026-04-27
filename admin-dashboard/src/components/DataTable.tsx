import { ReactNode } from "react";

export const DataTable = <T extends { id?: string }>({
  columns,
  rows,
  empty = "No records found",
  actions
}: {
  columns: { key: keyof T | string; label: string; render?: (row: T) => ReactNode }[];
  rows: T[];
  empty?: string;
  actions?: (row: T) => ReactNode;
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-slate-100 text-sm">
      <thead className="bg-slate-50">
        <tr>
          {columns.map((column) => <th key={String(column.key)} className="px-4 py-3 text-left font-semibold text-slate-600">{column.label}</th>)}
          {actions ? <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th> : null}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length + (actions ? 1 : 0)}>{empty}</td></tr>
        ) : (
          rows.map((row, index) => (
            <tr key={row.id ?? index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-4 py-3 text-slate-700">
                  {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}
                </td>
              ))}
              {actions ? <td className="px-4 py-3 text-right">{actions(row)}</td> : null}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
