import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface CategoryRow {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  isActive: boolean;
}

export const CategoriesPage = () => {
  const { data, loading, setData } = useAsync<CategoryRow[]>(() => endpoints.categories(), []);
  const [open, setOpen] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = await endpoints.create("/categories", {
      name: form.get("name"),
      description: form.get("description"),
      icon: form.get("icon"),
      color: form.get("color"),
      isActive: true
    });
    setData([created, ...(data ?? [])]);
    setOpen(false);
  };
  return (
    <>
      <PageHeader title="Categories Management" subtitle="Anatomy, physiology, pathology, pharmacology, first aid, clinical cases, and more." action={<button className="btn" onClick={() => setOpen(true)}>Add category</button>} />
      {loading ? <div className="card">Loading categories...</div> : <DataTable rows={data ?? []} columns={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "icon", label: "Icon" },
        { key: "color", label: "Color" },
        { key: "isActive", label: "Status", render: (row) => row.isActive ? "Active" : "Inactive" }
      ]} />}
      <ModalForm title="Add category" open={open} onClose={() => setOpen(false)} onSubmit={submit}>
        <input name="name" className="input" placeholder="Name" required />
        <input name="icon" className="input" placeholder="Icon key or URL" />
        <input name="color" className="input" defaultValue="#2563eb" />
        <textarea name="description" className="input sm:col-span-2" placeholder="Description" />
      </ModalForm>
    </>
  );
};
