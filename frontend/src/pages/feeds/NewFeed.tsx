import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFeed } from "@/services/feeds";

const NewFeed: React.FC = () => {
  const [feedUrl, setFeedUrl] = useState("");
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim()) return setErr("L’URL du flux est requise");

    try {
      setLoading(true);
      setErr(null);
      const feed = await createFeed({ feed_url: feedUrl.trim(), title: title || undefined });
      navigate(`/feeds/${feed.id}`);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Création impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Ajouter un flux</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">URL du flux (RSS/Atom)</label>
          <input
            className="w-full border rounded-lg p-3"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="https://exemple.com/feed.xml"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Titre (optionnel)</label>
          <input
            className="w-full border rounded-lg p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom affiché"
          />
        </div>
        {err && <div className="text-red-600">{err}</div>}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-black text-white" disabled={loading}>
            {loading ? "Ajout…" : "Ajouter"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border"
            onClick={() => navigate("/feeds")}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewFeed;
