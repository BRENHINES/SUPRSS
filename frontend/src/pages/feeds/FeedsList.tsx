import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listFeeds, type Feed } from "@/services/feeds";

const FeedsList: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await listFeeds();
        setFeeds(data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Impossible de charger les flux");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes flux</h1>
        <Link to="/feeds/new" className="px-4 py-2 rounded-lg bg-black text-white">
          Nouveau flux
        </Link>
      </div>

      {loading && <div className="mt-6">Chargement…</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="mt-6 border rounded-2xl divide-y">
          {feeds.length === 0 ? (
            <div className="p-6 text-neutral-600">Aucun flux pour l’instant.</div>
          ) : (
            feeds.map((f) => (
              <Link
                key={f.id}
                to={`/feeds/${f.id}`}
                className="p-4 flex items-center justify-between hover:bg-neutral-50"
              >
                <div>
                  <div className="font-medium">{f.title || f.feed_url}</div>
                  <div className="text-sm text-neutral-600">{f.feed_url}</div>
                </div>
                {typeof f.unread_count === "number" && (
                  <span className="text-sm px-2 py-1 rounded bg-neutral-200">
                    {f.unread_count} non lus
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FeedsList;
