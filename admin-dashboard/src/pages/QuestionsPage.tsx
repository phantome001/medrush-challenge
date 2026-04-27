import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface QuestionRow {
  id: string;
  questionText: string;
  difficulty: string;
  isPremium: boolean;
  category?: { name: string };
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  tags?: string[];
}

export const QuestionsPage = () => {
  const { data, loading, error, setData } = useAsync<QuestionRow[]>(() => endpoints.questions<QuestionRow[]>(), []);
  const { data: categories } = useAsync<{ id: string; name: string }[]>(() => endpoints.categories(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [formError, setFormError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFormError("");
    try {
      const payload = {
      categoryId: form.get("categoryId"),
      questionText: form.get("questionText"),
      imageUrl: form.get("imageUrl"),
      optionA: form.get("optionA"),
      optionB: form.get("optionB"),
      optionC: form.get("optionC"),
      optionD: form.get("optionD"),
      correctAnswer: form.get("correctAnswer"),
      explanation: form.get("explanation"),
      difficulty: form.get("difficulty"),
      isPremium: form.get("isPremium") === "on",
      tags: String(form.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean)
      };
      const saved = editing ? await endpoints.update("/questions", editing.id, payload) : await endpoints.create("/questions", payload);
      setData(editing ? (data ?? []).map((question) => question.id === editing.id ? saved : question) : [saved, ...(data ?? [])]);
      setEditing(null);
      setOpen(false);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save question");
    }
  };

  const remove = async (id: string) => {
    await endpoints.remove("/questions", id);
    setData((data ?? []).filter((question) => question.id !== id));
  };

  return (
    <>
      <PageHeader title="Questions Management" subtitle="Multiple choice, true/false, image, and clinical-style question bank." action={<button className="btn" onClick={() => { setEditing(null); setOpen(true); }}>Add question</button>} />
      {error ? <div className="card border-red-200 bg-red-50 text-red-700">{error}</div> : null}
      {loading ? <div className="card">Loading questions...</div> : <DataTable rows={data ?? []} columns={[
        { key: "questionText", label: "Question" },
        { key: "category", label: "Category", render: (row) => row.category?.name ?? "-" },
        { key: "difficulty", label: "Difficulty" },
        { key: "isPremium", label: "Access", render: (row) => row.isPremium ? "Premium" : "Free" }
      ]} actions={(row) => (
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => { setEditing(row); setOpen(true); }}>Edit</button>
          <button className="btn-secondary" onClick={() => remove(row.id)}>Delete</button>
        </div>
      )} />}
      <ModalForm title={editing ? "Edit question" : "Add question"} open={open} onClose={() => setOpen(false)} onSubmit={submit} error={formError}>
        <select name="categoryId" className="input" required>{(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select name="difficulty" className="input" defaultValue={editing?.difficulty ?? "EASY"}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select>
        <textarea name="questionText" className="input sm:col-span-2" placeholder="Question text" defaultValue={editing?.questionText} required />
        <input name="imageUrl" className="input sm:col-span-2" placeholder="Optional image URL" />
        <input name="optionA" className="input" placeholder="Option A" defaultValue={editing?.optionA} required />
        <input name="optionB" className="input" placeholder="Option B" defaultValue={editing?.optionB} required />
        <input name="optionC" className="input" placeholder="Option C" defaultValue={editing?.optionC} required />
        <input name="optionD" className="input" placeholder="Option D" defaultValue={editing?.optionD} required />
        <select name="correctAnswer" className="input" defaultValue={editing?.correctAnswer ?? "A"}><option>A</option><option>B</option><option>C</option><option>D</option></select>
        <input name="tags" className="input" placeholder="Tags comma separated" defaultValue={editing?.tags?.join(", ")} />
        <textarea name="explanation" className="input sm:col-span-2" placeholder="Explanation" defaultValue={editing?.explanation} required />
        <label className="flex items-center gap-2 text-sm"><input name="isPremium" type="checkbox" defaultChecked={editing?.isPremium} /> Premium</label>
      </ModalForm>
    </>
  );
};
