import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFeed, updateFeed, type Feed } from "@/services/feeds";

const EditFeed: React.FC = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => {
    if (!feedId) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const f = await getFeed(feedId);
        setTitle(f.title || "");
        setSiteUrl(f.site_url || "");
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Impossible de charger le flux");
      } finally {
        setLoading(false);
      }
    })();
  }, [feedId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedId) return;
    try {
      setErr(null);
      setLoading(true);
      await updateFeed(feedId, { title, site_url: siteUrl });
      navigate(`/feeds/${feedId}`);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Mise à jour impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Modifier le flux</h1>
      {loading && <div className="mt-6">Chargement…</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}
      {!loading && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Titre</label>
            <input
              className="w-full border rounded-lg p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du flux"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">URL du site (optionnel)</label>
            <input
              className="w-full border rounded-lg p-3"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://exemple.com"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-black text-white" disabled={loading}>
              Enregistrer
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border"
              onClick={() => navigate(-1)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditFeed;
