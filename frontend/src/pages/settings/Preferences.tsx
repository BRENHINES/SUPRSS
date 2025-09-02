import React, { useEffect, useState } from "react";
import { getMe, updateUser, type User } from "@/services/user";

const Preferences: React.FC = () => {
  const [me, setMe] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light"|"dark"|"auto">("light");
  const [font, setFont] = useState<"small"|"medium"|"large">("medium");
  const [perPage, setPerPage] = useState(20);
  const [autoRead, setAutoRead] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=> {
    (async()=>{
      const u = await getMe();
      setMe(u);
      setTheme((u.theme as any) || "light");
      setFont((u.font_size as any) || "medium");
      setPerPage(u.articles_per_page || 20);
      setAutoRead(!!u.auto_mark_read);
    })();
  }, []);

  if (!me) return <div className="p-6">Chargement…</div>;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null); setErr(null);
    try {
      const updated = await updateUser(me.id, {
        theme, font_size: font, articles_per_page: perPage, auto_mark_read: autoRead
      });
      setMe(updated);
      setMsg("Préférences enregistrées.");
    } catch (e:any) {
      setErr(e?.response?.data?.detail || "Échec de mise à jour.");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Préférences</h1>
      <form onSubmit={onSave} className="mt-4 space-y-4">
        {msg && <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
        {err && <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">{err}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Thème</span>
            <select className="border rounded w-full px-3 py-2" value={theme} onChange={(e)=>setTheme(e.target.value as any)}>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="auto">Auto</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Taille de police</span>
            <select className="border rounded w-full px-3 py-2" value={font} onChange={(e)=>setFont(e.target.value as any)}>
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Articles par page</span>
            <input type="number" min={5} max={100} className="border rounded w-full px-3 py-2"
                   value={perPage} onChange={(e)=>setPerPage(parseInt(e.target.value||"20",10))} />
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={autoRead} onChange={(e)=>setAutoRead(e.target.checked)} />
            <span>Marquer automatiquement comme lu lors de l’ouverture</span>
          </label>
        </div>

        <button disabled={saving} className="px-4 py-2 border rounded disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
};
export default Preferences;
