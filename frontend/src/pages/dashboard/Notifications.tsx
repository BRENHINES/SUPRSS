// src/pages/Notifications.tsx
import React, { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";

const Notifications: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [desktopAlerts, setDesktopAlerts] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(()=>{
    setEmailAlerts(localStorage.getItem("notif.email")==="1");
    setDesktopAlerts(localStorage.getItem("notif.desktop")==="1");
  }, []);

  const askDesktopPermission = async () => {
    if (!("Notification" in window)) return alert("Notifications non supportées.");
    const perm = await Notification.requestPermission();
    if (perm === "granted") setDesktopAlerts(true);
  };

  const save = () => {
    localStorage.setItem("notif.email", emailAlerts ? "1":"0");
    localStorage.setItem("notif.desktop", desktopAlerts ? "1":"0");
    setMsg("Préférences de notifications enregistrées (local).");
    setTimeout(()=>setMsg(null), 1500);
  };

  return (
    <AppShell>
      <PageHeader title="Notifications" subtitle="Alertes email et bureau" />
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16 pb-10">
        {msg && <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
        <div className="rounded-2xl bg-white border border-neutral-200 p-5 max-w-xl">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={emailAlerts} onChange={(e)=>setEmailAlerts(e.target.checked)} />
            <span>Alertes par e-mail</span>
          </label>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={desktopAlerts}
              onChange={(e)=>setDesktopAlerts(e.target.checked)}
            />
            <span>Notifications bureau</span>
            {!desktopAlerts && (
              <button
                onClick={askDesktopPermission}
                className="ml-2 px-3 py-1 rounded-lg border"
              >
                Autoriser
              </button>
            )}
          </div>

          <button onClick={save} className="mt-6 px-4 py-2 border rounded-xl bg-emerald-700 text-white">
            Enregistrer
          </button>
        </div>
      </div>
    </AppShell>
  );
};
export default Notifications;
