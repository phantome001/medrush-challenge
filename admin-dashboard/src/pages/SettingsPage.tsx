import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";

export const SettingsPage = () => {
  const [saved, setSaved] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };
  return (
    <>
      <PageHeader title="Platform Settings" subtitle="Branding, contact email, default language, maintenance mode, terms, and privacy." />
      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-2">
        {saved ? <div className="rounded-xl bg-green-50 p-3 text-green-700 md:col-span-2">Settings saved locally for this admin session.</div> : null}
        <input className="input" defaultValue="MedRush Challenge" placeholder="Platform name" />
        <input className="input" defaultValue="support@medrush.com" placeholder="Contact email" />
        <select className="input" defaultValue="English"><option>English</option><option>Arabic</option><option>French</option></select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Maintenance mode</label>
        <textarea className="input md:col-span-2" defaultValue="Terms of use placeholder for MedRush Challenge." />
        <textarea className="input md:col-span-2" defaultValue="Privacy policy placeholder for MedRush Challenge." />
        <button className="btn md:col-span-2">Save settings</button>
      </form>
    </>
  );
};
