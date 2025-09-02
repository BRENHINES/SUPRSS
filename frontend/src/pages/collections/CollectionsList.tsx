import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCollections, type Collection } from "@/services/collections";

const CollectionsList: React.FC = () => {
  const [items, setItems] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await listCollections();
        setItems(data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Impossible de charger les collections");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes collections</h1>
        <Link to="/collections/new" className="px-4 py-2 rounded-lg bg-black text-white">
          Nouvelle collection
        </Link>
      </div>

      {loading && <div className="mt-6">Chargement…</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="mt-6 border rounded-2xl divide-y">
          {items.length === 0 ? (
            <div className="p-6 text-neutral-600">Aucune collection.</div>
          ) : (
            items.map((c) => (
              <Link
                key={c.id}
                to={`/collections/${c.id}`}
                className="p-4 flex items-center justify-between hover:bg-neutral-50"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-neutral-600">
                    {c.description || "—"}
                  </div>
                </div>
                <div className="text-sm text-neutral-700 flex gap-3">
                  {typeof c.feeds_count === "number" && <span>{c.feeds_count} flux</span>}
                  {typeof c.members_count === "number" && <span>{c.members_count} membres</span>}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionsList;
