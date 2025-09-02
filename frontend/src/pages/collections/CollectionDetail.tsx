import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteCollection, getCollection, updateCollection, type Collection } from "@/services/collections";

const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await getCollection(id);
        setItem(data);
        setName(data.name || "");
        setDesc(data.description || "");
        setIsPublic(Boolean(data.is_public));
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Chargement impossible");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setErr(null);
      const updated = await updateCollection(id, { name, description: desc, is_public: isPublic });
      setItem(updated);
      setEditMode(false);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Mise à jour impossible");
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (!confirm("Supprimer cette collection ?")) return;
    try {
      await deleteCollection(id);
      navigate("/collections");
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Suppression impossible");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Détails de la collection</h1>
        <div className="flex gap-2">
          <Link to={`/collections/${id}/members`} className="px-3 py-2 rounded-lg border">
            Membres
          </Link>
          <button onClick={() => setEditMode((v) => !v)} className="px-3 py-2 rounded-lg border">
            {editMode ? "Annuler" : "Modifier"}
          </button>
          <button onClick={onDelete} className="px-3 py-2 rounded-lg border">
            Supprimer
          </button>
        </div>
      </div>

      {loading && <div className="mt-6">Chargement…</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {item && !editMode && (
        <div className="mt-6 border rounded-2xl p-6 space-y-2">
          <div><span className="font-medium">Nom :</span> {item.name}</div>
          <div><span className="font-medium">Description :</span> {item.description || "—"}</div>
          <div><span className="font-medium">Visibilité :</span> {item.is_public ? "Publique" : "Privée"}</div>
          <div className="text-sm text-neutral-600">
            {typeof item.feeds_count === "number" && <span className="mr-4">{item.feeds_count} flux</span>}
            {typeof item.members_count === "number" && <span>{item.members_count} membres</span>}
          </div>
        </div>
      )}

      {item && editMode && (
        <form onSubmit={onSave} className="mt-6 border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Nom</label>
            <input className="w-full border rounded-lg p-3" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea className="w-full border rounded-lg p-3" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Publique
          </label>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-black text-white">Enregistrer</button>
            <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg border">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <Link to="/collections" className="text-blue-600">← Retour</Link>
      </div>
    </div>
  );
};

export default CollectionDetail;
