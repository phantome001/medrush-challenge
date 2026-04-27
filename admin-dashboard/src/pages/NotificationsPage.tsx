import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { endpoints } from "../services/api";

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
}

export const NotificationsPage = () => {
  const { data, loading } = useAsync<NotificationRow[]>(() => endpoints.notifications(), []);

  return (
    <>
      <PageHeader title="Notifications" subtitle="Daily challenge reminders, quiz updates, subscription reminders, and badge alerts." />
      {loading ? <div className="card">Loading notifications...</div> : <DataTable rows={data ?? []} columns={[
        { key: "title", label: "Title" },
        { key: "message", label: "Message" },
        { key: "type", label: "Type" },
        { key: "isRead", label: "Status", render: (row) => row.isRead ? "Read" : "Unread" }
      ]} />}
    </>
  );
};
