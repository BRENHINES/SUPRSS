import React, { useState } from "react";
import { changeMyPassword } from "@/services/user";

const Security: React.FC = () => {
  const [oldp, setOld] = useState("");
  const [newp, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    if (newp !== confirm) { setErr("Les mots de passe ne correspondent pas."); return; }
    setSaving(true);
    try {
      await changeMyPassword(oldp, newp);
      setMsg("Mot de passe changé.");
      setOld(""); setNew(""); setConfirm("");
    } catch (e:any) {
      setErr(e?.response?.data?.detail || "Échec du changement de mot de passe.");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold">Sécurité</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {msg && <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
        {err && <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">{err}</div>}
        <div>
          <label className="block text-sm mb-1">Ancien mot de passe</label>
          <input type="password" className="border rounded w-full px-3 py-2" value={oldp} onChange={(e)=>setOld(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Nouveau mot de passe</label>
          <input type="password" className="border rounded w-full px-3 py-2" value={newp} onChange={(e)=>setNew(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmer</label>
          <input type="password" className="border rounded w-full px-3 py-2" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        </div>
        <button disabled={saving} className="px-4 py-2 border rounded disabled:opacity-50">
          {saving ? "Enregistrement…" : "Changer"}
        </button>
      </form>
    </div>
  );
};
export default Security;
