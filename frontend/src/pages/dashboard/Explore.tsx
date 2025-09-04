// src/pages/Explore.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import {
  getPopularFeeds,
  getTrendingArticles,
  getCategories,
  discoverByCategory,
  type ExploreFeed,
  type ExploreArticle,
} from "@/services/explore";
import { subscribeToFeed } from "@/services/feeds";

const Explore: React.FC = () => {
  const [popular, setPopular] = useState<ExploreFeed[]>([]);
  const [trending, setTrending] = useState<ExploreArticle[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [byCat, setByCat] = useState<ExploreFeed[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoad(true);
        setErr(null);
        const [p, t, c] = await Promise.all([
          getPopularFeeds(),
          getTrendingArticles({ page: 1, size: 10 }),
          getCategories(),
        ]);
        setPopular(p);
        setTrending(t);
        setCats(c);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Chargement impossible");
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeCat) { setByCat([]); return; }
    (async () => {
      try {
        setLoad(true);
        const data = await discoverByCategory(activeCat);
        setByCat(data);
      } catch {
        setByCat([]);
      } finally {
        setLoad(false);
      }
    })();
  }, [activeCat]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const header = useMemo(() => (
    <div className="flex items-center gap-3">
      <form onSubmit={onSearch} className="ml-auto flex gap-2">
        <input
          className="border rounded-xl px-3 py-2 w-64 bg-white"
          placeholder="Rechercher des flux ou articles…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-4 py-2 rounded-xl bg-emerald-700 text-white">Rechercher</button>
      </form>
    </div>
  ), [q]);

  return (
    <AppShell>
      <PageHeader title="Explorer" right={header} />
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16 pb-10">
        {err && <div className="text-red-600 mb-4">{err}</div>}
        {load && <div className="mb-4">Chargement…</div>}

        {/* Catégories */}
        {cats.length > 0 && (
          <div className="mb-8">
            <div className="text-sm text-neutral-600 mb-2">Catégories</div>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat((prev) => prev === c ? null : c)}
                  className={`px-3 py-1 rounded-full border ${activeCat === c ? "bg-emerald-700 text-white" : "bg-white"}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {activeCat && (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {byCat.map((f) => <FeedCard key={`${f.id}-${f.feed_url}`} feed={f} />)}
                {byCat.length === 0 && !load && (
                  <div className="text-neutral-600">Aucun flux proposé.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Populaires */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Flux populaires</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((f) => <FeedCard key={f.id} feed={f} />)}
            {popular.length === 0 && !load && (
              <div className="text-neutral-600">Aucun flux populaire.</div>
            )}
          </div>
        </section>

        {/* Tendances */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Articles tendances</h2>
          <div className="space-y-3">
            {trending.map((a) => (
              <Link
                key={a.id}
                to={`/articles/${a.id}`}
                className="block border rounded-2xl p-4 hover:bg-neutral-50 bg-white"
              >
                <div className="font-medium text-teal-900">{a.title}</div>
                <div className="text-sm text-neutral-600">
                  {a.feed_title || "—"} {a.published_at ? `• ${new Date(a.published_at).toLocaleString()}` : ""}
                </div>
              </Link>
            ))}
            {trending.length === 0 && !load && (
              <div className="text-neutral-600">Rien de tendance pour l’instant.</div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
};

const FeedCard: React.FC<{ feed: ExploreFeed }> = ({ feed }) => {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const handleSub = async () => {
    try {
      setBusy(true);
      await subscribeToFeed({ feed_id: feed.id, feed_url: feed.feed_url }); // accepte id OU url selon ton backend
      setOk(true);
    } catch {
      // toast/erreur si tu veux
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="font-medium text-teal-900">{feed.title}</div>
      {feed.site_url && (
        <a href={feed.site_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">
          {feed.site_url}
        </a>
      )}
      {feed.description && <div className="text-sm text-neutral-700 mt-1">{feed.description}</div>}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleSub}
          disabled={busy || ok}
          className="px-3 py-1 rounded-xl border disabled:opacity-60"
        >
          {ok ? "Abonné" : busy ? "…" : "S’abonner"}
        </button>
        {typeof feed.followers === "number" && (
          <div className="text-xs text-neutral-600">{feed.followers} abonnés</div>
        )}
      </div>
    </div>
  );
};

export default Explore;
