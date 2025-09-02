import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCollection } from "@/services/collections";

const NewCollection: React.FC = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr("Le nom est requis");
    try {
      setLoading(true);
      setErr(null);
      const row = await createCollection({ name: name.trim(), description: desc || undefined, is_public: isPublic });
      navigate(`/collections/${row.id}`);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Création impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Créer une collection</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input
            className="w-full border rounded-lg p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Veille IA"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description (optionnel)</label>
          <textarea
            className="w-full border rounded-lg p-3"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="But de la collection…"
          />
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Rendre la collection publique
        </label>

        {err && <div className="text-red-600">{err}</div>}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-black text-white" disabled={loading}>
            {loading ? "Création…" : "Créer"}
          </button>
          <button type="button" className="px-4 py-2 rounded-lg border" onClick={() => navigate("/collections")}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCollection;
