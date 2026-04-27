import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface QuizRow {
  id: string;
  title: string;
  difficulty: string;
  isPremium: boolean;
  timeLimit: number;
  status: string;
  category?: { name: string };
}

export const QuizManagementPage = () => {
  const { data, loading, setData } = useAsync<QuizRow[]>(() => endpoints.quizzes<QuizRow[]>(), []);
  const { data: categories } = useAsync<{ id: string; name: string }[]>(() => endpoints.categories(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuizRow | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      categoryId: form.get("categoryId"),
      difficulty: form.get("difficulty"),
      isPremium: form.get("isPremium") === "on",
      timeLimit: Number(form.get("timeLimit")),
      status: form.get("status")
    };
    const saved = editing ? await endpoints.update("/quizzes", editing.id, payload) : await endpoints.create("/quizzes", payload);
    setData(editing ? (data ?? []).map((quiz) => quiz.id === editing.id ? saved : quiz) : [saved, ...(data ?? [])]);
    setEditing(null);
    setOpen(false);
  };

  const remove = async (id: string) => {
    await endpoints.remove("/quizzes", id);
    setData((data ?? []).filter((quiz) => quiz.id !== id));
  };

  return (
    <>
      <PageHeader title="Quiz Management" subtitle="Add, edit, publish, unpublish, and assign quizzes to categories or tenants." action={<button className="btn" onClick={() => { setEditing(null); setOpen(true); }}>Add quiz</button>} />
      {loading ? <div className="card">Loading quizzes...</div> : (
        <DataTable rows={data ?? []} columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category", render: (row) => row.category?.name ?? "-" },
          { key: "difficulty", label: "Difficulty" },
          { key: "isPremium", label: "Premium", render: (row) => row.isPremium ? "Premium" : "Free" },
          { key: "timeLimit", label: "Time limit" },
          { key: "status", label: "Status" }
        ]} actions={(row) => (
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => { setEditing(row); setOpen(true); }}>Edit</button>
            <button className="btn-secondary" onClick={() => remove(row.id)}>Delete</button>
          </div>
        )} />
      )}
      <ModalForm title={editing ? "Edit quiz" : "Add quiz"} open={open} onClose={() => setOpen(false)} onSubmit={submit}>
        <input name="title" className="input" placeholder="Title" defaultValue={editing?.title} required />
        <select name="categoryId" className="input" required>{(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <textarea name="description" className="input sm:col-span-2" placeholder="Description" />
        <select name="difficulty" className="input" defaultValue={editing?.difficulty ?? "EASY"}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select>
        <input name="timeLimit" type="number" className="input" defaultValue={editing?.timeLimit ?? 60} />
        <select name="status" className="input" defaultValue={editing?.status ?? "DRAFT"}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
        <label className="flex items-center gap-2 text-sm"><input name="isPremium" type="checkbox" defaultChecked={editing?.isPremium} /> Premium</label>
      </ModalForm>
    </>
  );
};
