import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface PlanRow {
  id: string;
  name: string;
  price: string;
  durationDays: number;
  maxStudents: number;
  maxTeachers: number;
  isActive: boolean;
}

export const PlansPage = () => {
  const { data, loading, setData } = useAsync<PlanRow[]>(() => endpoints.plans(), []);
  const [open, setOpen] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = await endpoints.create("/subscriptions/plans", {
      name: form.get("name"),
      price: Number(form.get("price")),
      durationDays: Number(form.get("durationDays")),
      maxStudents: Number(form.get("maxStudents")),
      maxTeachers: Number(form.get("maxTeachers")),
      features: String(form.get("features") ?? "").split("\n").filter(Boolean),
      isActive: true
    });
    setData([created, ...(data ?? [])]);
    setOpen(false);
  };
  return (
    <>
      <PageHeader title="Subscription Plans" subtitle="Free, Student Premium, Institution Basic/Pro/Enterprise plans." action={<button className="btn" onClick={() => setOpen(true)}>Add plan</button>} />
      {loading ? <div className="card">Loading plans...</div> : <DataTable rows={data ?? []} columns={[
        { key: "name", label: "Name" },
        { key: "price", label: "Price" },
        { key: "durationDays", label: "Duration" },
        { key: "maxStudents", label: "Students" },
        { key: "maxTeachers", label: "Teachers" },
        { key: "isActive", label: "Status", render: (row) => row.isActive ? "Active" : "Inactive" }
      ]} />}
      <ModalForm title="Add plan" open={open} onClose={() => setOpen(false)} onSubmit={submit}>
        <input name="name" className="input" placeholder="Name" required />
        <input name="price" className="input" type="number" step="0.01" placeholder="Price" required />
        <input name="durationDays" className="input" type="number" defaultValue={30} />
        <input name="maxStudents" className="input" type="number" defaultValue={0} />
        <input name="maxTeachers" className="input" type="number" defaultValue={0} />
        <textarea name="features" className="input sm:col-span-2" placeholder="One feature per line" />
      </ModalForm>
    </>
  );
};
