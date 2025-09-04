// src/pages/SearchPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
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
    if (!qUrl.trim()) { setItems([]); return; }
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await searchArticles(qUrl);
        setItems(Array.isArray(data) ? data : []);
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
    <AppShell>
      <PageHeader title="Recherche" subtitle="Trouvez des articles dans vos flux" />
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16 pb-10">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            className="flex-1 border rounded-xl px-3 py-2 bg-white"
            placeholder="Rechercher des articles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="px-4 py-2 rounded-xl bg-emerald-700 text-white" type="submit">
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
                  className="block border rounded-2xl p-4 hover:bg-neutral-50 bg-white"
                >
                  <div className="font-medium text-teal-900">{a.title}</div>
                  <div className="text-sm text-neutral-600">
                    {a.feed_title || "—"}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default SearchPage;
