import { FormEvent, ReactNode } from "react";

export const ModalForm = ({
  title,
  open,
  onClose,
  onSubmit,
  children,
  error,
  saving = false
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  error?: string;
  saving?: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form onSubmit={onSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="btn-secondary">Close</button>
        </div>
        {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        <button className="btn mt-6 w-full disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
};
