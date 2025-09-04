// src/pages/feeds/FeedDetail.tsx
import React, { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArticlesAPI, FeedsAPI, type Feed, type Article } from "@/services/app";

const FeedDetail: React.FC = () => {
  const { feedId } = useParams();
  const id = Number(feedId);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [articles, setArticles] = useState<Article[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    FeedsAPI.get(id).then(setFeed);
    ArticlesAPI.byFeed(id).then(setArticles);
  }, [id]);

  return (
    <AppShell>
      <PageHeader
        title={feed?.title ?? "Flux"}
        subtitle={feed?.site}
        right={
          <button
            onClick={() => navigate(`/feeds/${id}/edit`)}
            className="rounded-xl bg-white border border-neutral-200 px-4 py-2 hover:border-emerald-700 transition"
          >
            Modifier
          </button>
        }
      />
      {!articles ? (
        <div className="text-neutral-600">Chargement…</div>
      ) : (
        <div className="grid gap-3">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/articles/${a.id}`}
              className="rounded-2xl bg-white border border-neutral-200 p-4 hover:border-emerald-600 transition block"
            >
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-neutral-500 mt-1">{new Date(a.date).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default FeedDetail;
