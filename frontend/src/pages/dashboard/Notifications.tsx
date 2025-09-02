import React, { useEffect, useState } from "react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/services/notifications";

function fmt(dateIso?: string) {
  if (!dateIso) return "";
  try { return new Date(dateIso).toLocaleString(); } catch { return dateIso; }
}

const Notifications: React.FC = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await listNotifications();
      setItems(data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onMarkOne = async (id: number) => {
    try {
      setBusy(true);
      await markNotificationRead(id);
      setItems((prev) => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } finally {
      setBusy(false);
    }
  };

  const onMarkAll = async () => {
    try {
      setBusy(true);
      await markAllNotificationsRead();
      setItems((prev) => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } finally {
      setBusy(false);
    }
  };

  const unreadCount = items.filter(n => !n.read_at).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <button
          onClick={onMarkAll}
          disabled={busy || unreadCount === 0}
          className="px-3 py-2 rounded-xl border disabled:opacity-60"
          title="Tout marquer comme lu"
        >
          Tout marquer comme lu {unreadCount > 0 ? `(${unreadCount})` : ""}
        </button>
      </div>

      {loading && <div>Chargement…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-neutral-600">Aucune notification.</div>
          ) : (
            items.map((n) => {
              const unread = !n.read_at;
              return (
                <div
                  key={n.id}
                  className={`border rounded-2xl p-4 ${unread ? "bg-yellow-50" : "bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{n.title}</div>
                      {n.body && <div className="text-sm text-neutral-700 mt-1">{n.body}</div>}
                      <div className="text-xs text-neutral-500 mt-2">{fmt(n.created_at)}</div>
                      {n.link && (
                        <a
                          href={n.link}
                          className="inline-block mt-2 text-blue-600"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ouvrir
                        </a>
                      )}
                    </div>
                    <div className="shrink-0">
                      {unread && (
                        <button
                          className="px-3 py-1 rounded-lg border"
                          onClick={() => onMarkOne(n.id)}
                          disabled={busy}
                        >
                          Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
