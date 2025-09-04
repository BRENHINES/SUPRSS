// src/pages/feeds/FeedsList.tsx
import React, { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Link, useNavigate } from "react-router-dom";
import { FeedsAPI, type Feed } from "@/services/app";
import { FiPlus, FiChevronRight } from "react-icons/fi";

const FeedsList: React.FC = () => {
  const [items, setItems] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    FeedsAPI.list().then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Mes flux"
        subtitle="Ajoute, organise et explore tes sources."
        right={
          <button
            onClick={() => navigate("/feeds/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2 hover:bg-emerald-900 transition"
          >
            <FiPlus /> Nouveau flux
          </button>
        }
      />
      {loading ? (
        <div className="text-neutral-500">Chargement…</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((f) => (
            <Link
              key={f.id}
              to={`/feeds/${f.id}`}
              className="rounded-2xl bg-white border border-neutral-200 p-4 hover:border-emerald-600 transition block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.title}</div>
                  <div className="text-sm text-neutral-600">{f.site ?? "—"}</div>
                </div>
                <div className="text-neutral-400"><FiChevronRight /></div>
              </div>
              {typeof f.unread === "number" && (
                <div className="mt-3 inline-flex rounded-full bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5">
                  {f.unread} non lus
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default FeedsList;
