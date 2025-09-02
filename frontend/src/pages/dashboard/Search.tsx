import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { searchArticles, type SearchResult } from "@/services/search";

const SearchPage: React.FC = () => {
  const [params] = useSearchParams();
  const qUrl = params.get("q") ?? "";
  const [q, setQ] = useState(qUrl);
  const [items, setItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // lance la recherche si un q est présent dans l’URL
    if (!qUrl) { setItems([]); return; }
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await searchArticles(qUrl);
        setItems(data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Recherche impossible");
      } finally {
        setLoading(false);
      }
    })();
  }, [qUrl]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Recherche</h1>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Rechercher des articles…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-4 py-2 rounded-xl bg-black text-white" type="submit">
          Rechercher
        </button>
      </form>

      {loading && <div className="mt-6">Chargement…</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && !err && qUrl && (
        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <div className="text-neutral-600">Aucun résultat.</div>
          ) : (
            items.map((a) => (
              <Link
                to={`/articles/${a.id}`}
                key={a.id}
                className="block border rounded-2xl p-4 hover:bg-neutral-50"
              >
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-neutral-600">
                  {a.feed_title || "—"}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
