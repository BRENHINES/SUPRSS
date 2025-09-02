import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addMemberByEmail, listMembers, removeMember, type Member } from "@/services/collections";

const CollectionMembers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actMsg, setActMsg] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setErr(null);
      setLoading(true);
      const rows = await listMembers(id);
      setItems(rows);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !email.trim()) return;
    try {
      setActMsg(null);
      await addMemberByEmail(id, email.trim());
      setEmail("");
      await load();
      setActMsg("Membre ajouté");
      setTimeout(() => setActMsg(null), 1200);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Ajout impossible");
    }
  };

  const onRemove = async (userId: number) => {
    if (!id) return;
    if (!confirm("Retirer ce membre ?")) return;
    try {
      await removeMember(id, userId);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Suppression impossible");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Membres</h1>
        <Link to={`/collections/${id}`} className="text-blue-600">← Détails</Link>
      </div>

      {loading && <div className="mt-6">Chargement…</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}
      {actMsg && <div className="mt-6 text-green-700">{actMsg}</div>}

      <form onSubmit={onAdd} className="mt-6 flex gap-2">
        <input
          className="flex-1 border rounded-lg p-3"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="px-4 py-2 rounded-lg bg-black text-white">Ajouter</button>
      </form>

      <div className="mt-6 border rounded-2xl divide-y">
        {items.length === 0 ? (
          <div className="p-6 text-neutral-600">Aucun membre.</div>
        ) : (
          items.map((m) => (
            <div key={m.user_id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.username}</div>
                <div className="text-sm text-neutral-600">{m.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-700">{m.role || "member"}</span>
                <button onClick={() => onRemove(m.user_id)} className="px-3 py-1 rounded-lg border">
                  Retirer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollectionMembers;
