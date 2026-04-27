import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface Institution {
  id: string;
  name: string;
  country: string;
  city: string;
  institutionCode: string;
  status: string;
  maxStudents: number;
  maxTeachers: number;
}

export const InstitutionsPage = () => {
  const { data, loading, setData } = useAsync<Institution[]>(() => endpoints.institutions<Institution[]>(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Institution | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      country: form.get("country"),
      city: form.get("city"),
      address: form.get("address"),
      maxStudents: Number(form.get("maxStudents")),
      maxTeachers: Number(form.get("maxTeachers")),
      status: form.get("status"),
      primaryColor: form.get("primaryColor"),
      secondaryColor: form.get("secondaryColor")
    };
    const saved = editing ? await endpoints.update("/institutions", editing.id, payload) : await endpoints.create("/institutions", payload);
    setData(editing ? (data ?? []).map((item) => item.id === editing.id ? saved : item) : [saved, ...(data ?? [])]);
    setEditing(null);
    setOpen(false);
  };

  const remove = async (id: string) => {
    await endpoints.remove("/institutions", id);
    setData((data ?? []).filter((item) => item.id !== id));
  };

  const suspend = async (id: string) => {
    const saved = await endpoints.postAction(`/institutions/${id}/suspend`);
    setData((data ?? []).map((item) => item.id === id ? saved : item));
  };

  return (
    <>
      <PageHeader title="Institutions Management" subtitle="Create, edit, suspend, delete, and manage tenant subscriptions." action={<button className="btn" onClick={() => { setEditing(null); setOpen(true); }}>Add institution</button>} />
      {loading ? <div className="card">Loading institutions...</div> : (
        <DataTable
          rows={data ?? []}
          columns={[
            { key: "name", label: "Name" },
            { key: "institutionCode", label: "Code" },
            { key: "country", label: "Country" },
            { key: "city", label: "City" },
            { key: "maxStudents", label: "Students" },
            { key: "maxTeachers", label: "Teachers" },
            { key: "status", label: "Status" }
          ]}
          actions={(row) => (
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => { setEditing(row); setOpen(true); }}>Edit</button>
              <button className="btn-secondary" onClick={() => suspend(row.id)}>Suspend</button>
              <button className="btn-secondary" onClick={() => remove(row.id)}>Delete</button>
            </div>
          )}
        />
      )}
      <ModalForm title={editing ? "Edit institution" : "Add institution"} open={open} onClose={() => setOpen(false)} onSubmit={submit}>
        <input name="name" className="input" placeholder="Name" defaultValue={editing?.name} required />
        <input name="email" className="input" placeholder="Email" type="email" />
        <input name="phone" className="input" placeholder="Phone" />
        <input name="country" className="input" placeholder="Country" defaultValue={editing?.country} required />
        <input name="city" className="input" placeholder="City" defaultValue={editing?.city} required />
        <input name="address" className="input" placeholder="Address" />
        <input name="maxStudents" className="input" placeholder="Max students" type="number" defaultValue={editing?.maxStudents ?? 100} />
        <input name="maxTeachers" className="input" placeholder="Max teachers" type="number" defaultValue={editing?.maxTeachers ?? 10} />
        <select name="status" className="input" defaultValue={editing?.status ?? "ACTIVE"}><option>ACTIVE</option><option>SUSPENDED</option><option>EXPIRED</option></select>
        <input name="primaryColor" className="input" defaultValue="#2563eb" />
        <input name="secondaryColor" className="input" defaultValue="#10b981" />
      </ModalForm>
    </>
  );
};
