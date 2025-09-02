import React, { useEffect, useState } from "react";
import { getMe, updateUser, uploadAvatar, deleteAvatar, type User } from "@/services/user";

const Profile: React.FC = () => {
  const [me, setMe] = useState<User | null>(null);
  const [full_name, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const u = await getMe();
    setMe(u);
    setFullName(u.full_name || "");
    setBio(u.bio || "");
  };
  useEffect(()=>{ load(); }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setSaving(true); setMsg(null); setErr(null);
    try {
      const updated = await updateUser(me.id, { full_name, bio });
      setMe(updated);
      setMsg("Profil mis à jour.");
    } catch (e:any) {
      setErr(e?.response?.data?.detail || "Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null); setMsg(null);
    try {
      const updated = await uploadAvatar(f);
      setMe(updated);
      setMsg("Avatar mis à jour.");
    } catch (e:any) {
      setErr(e?.response?.data?.detail || "Upload avatar impossible.");
    }
  };

  const onAvatarDelete = async () => {
    if (!me) return;
    setErr(null); setMsg(null);
    try {
      await deleteAvatar();
      setMe({ ...me, avatar_url: null });
      setMsg("Avatar supprimé.");
    } catch (e:any) {
      setErr(e?.response?.data?.detail || "Suppression avatar impossible.");
    }
  };

  if (!me) return <div className="p-6">Chargement…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Profil</h1>

      <div className="mt-4 flex items-center gap-4">
        <img
          src={me.avatar_url || "https://via.placeholder.com/96?text=Avatar"}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div className="space-x-2">
          <label className="px-3 py-1 border rounded cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            Changer l’avatar
          </label>
          {me.avatar_url && (
            <button className="px-3 py-1 border rounded" onClick={onAvatarDelete}>
              Supprimer
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        {msg && <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
        {err && <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">{err}</div>}

        <div>
          <label className="block text-sm mb-1">Nom complet</label>
          <input className="border rounded w-full px-3 py-2"
                 value={full_name} onChange={(e)=>setFullName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea className="border rounded w-full px-3 py-2" rows={4}
                    value={bio} onChange={(e)=>setBio(e.target.value)} />
        </div>

        <button disabled={saving} className="px-4 py-2 border rounded disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
};
export default Profile;
