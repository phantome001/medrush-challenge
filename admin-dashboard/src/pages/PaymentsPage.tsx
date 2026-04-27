import { FormEvent, useState } from "react";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface PaymentRow {
  id: string;
  amount: string;
  method: string;
  status: string;
  transactionReference?: string;
  notes?: string;
  createdAt: string;
}

export const PaymentsPage = () => {
  const { data, loading, setData } = useAsync<PaymentRow[]>(() => endpoints.payments<PaymentRow[]>(), []);
  const [open, setOpen] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const created = await endpoints.create("/payments", {
      amount: Number(form.get("amount")),
      method: form.get("method"),
      status: form.get("status"),
      transactionReference: form.get("transactionReference"),
      notes: form.get("notes")
    });
    setData([created, ...(data ?? [])]);
    setOpen(false);
  };
  return (
    <>
      <PageHeader title="Payments" subtitle="Manual payment tracking with status and transaction references." action={<button className="btn" onClick={() => setOpen(true)}>Add payment</button>} />
      {loading ? <div className="card">Loading payments...</div> : <DataTable rows={data ?? []} columns={[
        { key: "amount", label: "Amount" },
        { key: "method", label: "Method" },
        { key: "status", label: "Status" },
        { key: "transactionReference", label: "Reference" },
        { key: "notes", label: "Notes" }
      ]} />}
      <ModalForm title="Add payment" open={open} onClose={() => setOpen(false)} onSubmit={submit}>
        <input name="amount" className="input" type="number" step="0.01" placeholder="Amount" required />
        <input name="method" className="input" placeholder="Payment method" required />
        <select name="status" className="input"><option>PENDING</option><option>PAID</option><option>FAILED</option><option>REFUNDED</option></select>
        <input name="transactionReference" className="input" placeholder="Transaction reference" />
        <textarea name="notes" className="input sm:col-span-2" placeholder="Notes" />
      </ModalForm>
    </>
  );
};
