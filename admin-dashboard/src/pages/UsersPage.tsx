import { FormEvent, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  specialty?: string;
  studyYear?: string;
  xp: number;
  level: number;
  isActive: boolean;
}

export const UsersPage = ({ roleFilter, title = "Users Management" }: { roleFilter?: string; title?: string }) => {
  const [search, setSearch] = useState("");
  const { data, loading, setData } = useAsync<UserRow[]>(() => endpoints.users<UserRow[]>(roleFilter ? { role: roleFilter } : undefined), [roleFilter]);
  const rows = useMemo(
    () => (data ?? []).filter((user) => `${user.fullName} ${user.email}`.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password") || undefined,
      role: form.get("role"),
      specialty: form.get("specialty"),
      studyYear: form.get("studyYear"),
      subscriptionStatus: form.get("subscriptionStatus")
    };
    const saved = editing ? await endpoints.update("/users", editing.id, payload) : await endpoints.create("/users", payload);
    setData(editing ? (data ?? []).map((user) => user.id === editing.id ? saved : user) : [saved, ...(data ?? [])]);
    setEditing(null);
    setOpen(false);
  };

  const suspend = async (id: string) => {
    const saved = await endpoints.postAction(`/users/${id}/suspend`);
    setData((data ?? []).map((user) => user.id === id ? saved : user));
  };

  const remove = async (id: string) => {
    await endpoints.remove("/users", id);
    setData((data ?? []).filter((user) => user.id !== id));
  };

  return (
    <>
      <PageHeader title={title} subtitle="Search, filter, create, suspend, reset password, and manage users." action={<button className="btn" onClick={() => { setEditing(null); setOpen(true); }}>Add user</button>} />
      <input className="input mb-4 max-w-md" placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} />
      {loading ? <div className="card">Loading users...</div> : (
        <DataTable
          rows={rows}
          columns={[
            { key: "fullName", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role" },
            { key: "specialty", label: "Specialty" },
            { key: "studyYear", label: "Study year" },
            { key: "xp", label: "XP" },
            { key: "level", label: "Level" },
            { key: "isActive", label: "Status", render: (row) => (row.isActive ? "Active" : "Suspended") }
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
      <ModalForm title={editing ? "Edit user" : "Add user"} open={open} onClose={() => setOpen(false)} onSubmit={submit}>
        <input name="fullName" className="input" placeholder="Full name" defaultValue={editing?.fullName} required />
        <input name="email" className="input" placeholder="Email" type="email" defaultValue={editing?.email} required />
        <input name="password" className="input" placeholder={editing ? "Leave blank to keep password" : "Password"} type="password" required={!editing} />
        <select name="role" className="input" defaultValue={editing?.role ?? roleFilter ?? "STUDENT"}>
          <option>SUPER_ADMIN</option><option>INSTITUTION_ADMIN</option><option>TEACHER</option><option>STUDENT</option>
        </select>
        <input name="specialty" className="input" placeholder="Specialty" defaultValue={editing?.specialty} />
        <input name="studyYear" className="input" placeholder="Study year" defaultValue={editing?.studyYear} />
        <select name="subscriptionStatus" className="input" defaultValue="FREE"><option>FREE</option><option>ACTIVE</option><option>EXPIRED</option><option>SUSPENDED</option></select>
      </ModalForm>
    </>
  );
};
