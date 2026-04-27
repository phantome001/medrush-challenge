import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface CaseRow {
  id: string;
  title: string;
  specialty: string;
  difficulty: string;
  isPremium: boolean;
  patientAge?: number;
  patientGender?: string;
  symptoms?: string;
  history?: string;
  physicalExam?: string;
  labResults?: string;
  question?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  learningNote?: string;
}

export const ClinicalCasesPage = () => {
  const { data, loading, error, setData } = useAsync<CaseRow[]>(() => endpoints.clinicalCases<CaseRow[]>(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CaseRow | null>(null);
  const [formError, setFormError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFormError("");
    try {
      const payload = {
      title: form.get("title"),
      patientAge: Number(form.get("patientAge")),
      patientGender: form.get("patientGender"),
      symptoms: form.get("symptoms"),
      history: form.get("history"),
      physicalExam: form.get("physicalExam"),
      labResults: form.get("labResults"),
      question: form.get("question"),
      optionA: form.get("optionA"),
      optionB: form.get("optionB"),
      optionC: form.get("optionC"),
      optionD: form.get("optionD"),
      correctAnswer: form.get("correctAnswer"),
      explanation: form.get("explanation"),
      learningNote: form.get("learningNote"),
      specialty: form.get("specialty"),
      difficulty: form.get("difficulty"),
      isPremium: form.get("isPremium") === "on"
      };
      const saved = editing ? await endpoints.update("/clinical-cases", editing.id, payload) : await endpoints.create("/clinical-cases", payload);
      setData(editing ? (data ?? []).map((item) => item.id === editing.id ? saved : item) : [saved, ...(data ?? [])]);
      setEditing(null);
      setOpen(false);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "Unable to save case");
    }
  };

  const remove = async (id: string) => {
    await endpoints.remove("/clinical-cases", id);
    setData((data ?? []).filter((item) => item.id !== id));
  };

  return (
    <>
      <PageHeader title="Clinical Cases Management" subtitle="Create educational cases with diagnosis questions, explanations, and learning notes." action={<button className="btn" onClick={() => { setEditing(null); setOpen(true); }}>Add clinical case</button>} />
      {error ? <div className="card border-red-200 bg-red-50 text-red-700">{error}</div> : null}
      {loading ? <div className="card">Loading cases...</div> : <DataTable rows={data ?? []} columns={[
        { key: "title", label: "Title" },
        { key: "specialty", label: "Specialty" },
        { key: "difficulty", label: "Difficulty" },
        { key: "isPremium", label: "Access", render: (row) => row.isPremium ? "Premium" : "Free" }
      ]} actions={(row) => (
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => { setEditing(row); setOpen(true); }}>Edit</button>
          <button className="btn-secondary" onClick={() => remove(row.id)}>Delete</button>
        </div>
      )} />}
      <ModalForm title={editing ? "Edit clinical case" : "Add clinical case"} open={open} onClose={() => setOpen(false)} onSubmit={submit} error={formError}>
        <input name="title" className="input" placeholder="Case title" defaultValue={editing?.title} required />
        <input name="patientAge" className="input" type="number" placeholder="Age" defaultValue={editing?.patientAge} required />
        <select name="patientGender" className="input" defaultValue={editing?.patientGender ?? "MALE"}><option>MALE</option><option>FEMALE</option><option>OTHER</option></select>
        <input name="specialty" className="input" placeholder="Specialty" defaultValue={editing?.specialty} required />
        <textarea name="symptoms" className="input" placeholder="Symptoms" defaultValue={editing?.symptoms} required />
        <textarea name="history" className="input" placeholder="History" defaultValue={editing?.history} required />
        <textarea name="physicalExam" className="input" placeholder="Physical exam" defaultValue={editing?.physicalExam} required />
        <textarea name="labResults" className="input" placeholder="Lab results" defaultValue={editing?.labResults} />
        <textarea name="question" className="input sm:col-span-2" placeholder="Question" defaultValue={editing?.question} required />
        <input name="optionA" className="input" placeholder="Option A" defaultValue={editing?.optionA} required />
        <input name="optionB" className="input" placeholder="Option B" defaultValue={editing?.optionB} required />
        <input name="optionC" className="input" placeholder="Option C" defaultValue={editing?.optionC} required />
        <input name="optionD" className="input" placeholder="Option D" defaultValue={editing?.optionD} required />
        <select name="correctAnswer" className="input" defaultValue={editing?.correctAnswer ?? "A"}><option>A</option><option>B</option><option>C</option><option>D</option></select>
        <select name="difficulty" className="input" defaultValue={editing?.difficulty ?? "EASY"}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select>
        <textarea name="explanation" className="input sm:col-span-2" placeholder="Explanation" defaultValue={editing?.explanation} required />
        <textarea name="learningNote" className="input sm:col-span-2" placeholder="Learning note" defaultValue={editing?.learningNote} required />
        <label className="flex items-center gap-2 text-sm"><input name="isPremium" type="checkbox" defaultChecked={editing?.isPremium} /> Premium</label>
      </ModalForm>
    </>
  );
};
