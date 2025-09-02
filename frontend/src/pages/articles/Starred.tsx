import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listStarred, type Article } from "@/services/articles";

const Starred: React.FC = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        setItems(await listStarred());
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Chargement impossible");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Étoilés</h1>
      {loading && <div className="mt-4">Chargement…</div>}
      {err && <div className="mt-4 text-red-600">{err}</div>}
      <div className="mt-4 space-y-3">
        {items.length === 0 && !loading ? (
          <div className="text-neutral-600">Aucun article étoilé.</div>
        ) : (
          items.map((a) => (
            <Link to={`/articles/${a.id}`} key={a.id} className="block border rounded-2xl p-4 hover:bg-neutral-50">
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-neutral-600">{a.feed_title || "—"}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Starred;
