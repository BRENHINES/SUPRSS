import React, { useEffect, useState } from "react";
import { getMe, updateUser, type User } from "@/services/user";

const Account: React.FC = () => {
  const [me, setMe] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getMe();
      setMe(u);
      setEmail(u.email);
      setUsername(u.username);
    })();
  }, []);

  if (!me) return <div className="p-6">Chargement…</div>;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null); setErr(null);
    try {
      const updated = await updateUser(me.id, { email, username });
      setMe(updated);
      setMsg("Compte mis à jour.");
    } catch (e:any) {
      setErr(e?.response?.data?.detail || "Échec de mise à jour.");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Compte</h1>
      <form onSubmit={onSave} className="mt-4 space-y-4">
        {msg && <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
        {err && <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">{err}</div>}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="border rounded w-full px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Nom d’utilisateur</label>
          <input className="border rounded w-full px-3 py-2" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <button disabled={saving} className="px-4 py-2 border rounded disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
};
export default Account;
