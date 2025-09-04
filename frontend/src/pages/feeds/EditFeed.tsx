// src/pages/feeds/FeedEdit.tsx
import React, { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useNavigate, useParams } from "react-router-dom";
import { FeedsAPI, type Feed } from "@/services/app";

const FeedEdit: React.FC = () => {
  const { feedId } = useParams();
  const id = Number(feedId);
  const [form, setForm] = useState<Partial<Feed>>({});
  const navigate = useNavigate();

  useEffect(() => {
    FeedsAPI.get(id).then((f) => setForm(f));
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await FeedsAPI.update(id, form);
    navigate(`/feeds/${id}`, { replace: true });
  };

  return (
    <AppShell>
      <PageHeader title="Modifier le flux" />
      <form onSubmit={onSubmit} className="max-w-xl grid gap-4">
        <div>
          <label className="text-sm text-neutral-700">Titre</label>
          <input
            value={form.title ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Site</label>
          <input
            value={form.site ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, site: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
          />
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 font-medium hover:bg-emerald-900 transition">
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl bg-white border border-neutral-200 px-5 py-2.5 hover:border-emerald-700 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </AppShell>
  );
};

export default FeedEdit;
