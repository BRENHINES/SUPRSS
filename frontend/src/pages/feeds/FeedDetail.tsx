import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteFeed, getFeed, refreshFeed, type Feed } from "@/services/feeds";

const FeedDetail: React.FC = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actMsg, setActMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!feedId) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await getFeed(feedId);
        setFeed(data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Impossible de charger le flux");
      } finally {
        setLoading(false);
      }
    })();
  }, [feedId]);

  const onDelete = async () => {
    if (!feedId) return;
    if (!confirm("Supprimer ce flux ?")) return;
    try {
      await deleteFeed(feedId);
      navigate("/feeds");
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "Suppression impossible");
    }
  };

  const onRefresh = async () => {
    if (!feedId) return;
    try {
      setActMsg("Actualisation en cours…");
      await refreshFeed(feedId); // si l’endpoint existe
      setActMsg("Actualisé !");
      setTimeout(() => setActMsg(null), 1500);
    } catch {
      setActMsg("Échec de l’actualisation");
      setTimeout(() => setActMsg(null), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Détails du flux</h1>
        <div className="flex gap-2">
          <Link to={`/feeds/${feedId}/edit`} className="px-3 py-2 rounded-lg border">
            Modifier
          </Link>
          <button onClick={onDelete} className="px-3 py-2 rounded-lg border">
            Supprimer
          </button>
          <button onClick={onRefresh} className="px-3 py-2 rounded-lg bg-black text-white">
            Actualiser
          </button>
        </div>
      </div>

      {loading && <div className="mt-6">Chargement…</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {feed && (
        <div className="mt-6 border rounded-2xl p-6 space-y-2">
          <div><span className="font-medium">Titre :</span> {feed.title || "—"}</div>
          <div><span className="font-medium">URL du flux :</span> {feed.feed_url}</div>
          {feed.site_url && (<div><span className="font-medium">Site :</span> {feed.site_url}</div>)}
          {typeof feed.unread_count === "number" && (
            <div><span className="font-medium">Non lus :</span> {feed.unread_count}</div>
          )}
          {feed.last_updated && (
            <div><span className="font-medium">Dernière maj :</span> {new Date(feed.last_updated).toLocaleString()}</div>
          )}
          {actMsg && <div className="text-sm text-neutral-600">{actMsg}</div>}
        </div>
      )}

      <div className="mt-6">
        <Link to="/feeds" className="text-blue-600">← Retour à la liste</Link>
      </div>
    </div>
  );
};

export default FeedDetail;
