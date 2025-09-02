import React, { useEffect, useState } from "react";

const Notifications: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [desktopAlerts, setDesktopAlerts] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(()=>{
    setEmailAlerts(localStorage.getItem("notif.email")==="1");
    setDesktopAlerts(localStorage.getItem("notif.desktop")==="1");
  }, []);
  const save = () => {
    localStorage.setItem("notif.email", emailAlerts ? "1":"0");
    localStorage.setItem("notif.desktop", desktopAlerts ? "1":"0");
    setMsg("Préférences de notifications enregistrées (local).");
    setTimeout(()=>setMsg(null), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Notifications</h1>
      {msg && <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
      <div className="mt-4 space-y-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={emailAlerts} onChange={(e)=>setEmailAlerts(e.target.checked)} />
          <span>Alertes par e-mail</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={desktopAlerts} onChange={(e)=>setDesktopAlerts(e.target.checked)} />
          <span>Notifications desktop</span>
        </label>
        <button onClick={save} className="px-4 py-2 border rounded">Enregistrer</button>
      </div>
    </div>
  );
};
export default Notifications;
