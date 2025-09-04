// src/pages/feeds/FeedNew.tsx
import React, { useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { FeedsAPI } from "@/services/app";
import { useNavigate } from "react-router-dom";

const FeedNew: React.FC = () => {
  const [url, setUrl] = useState("");
  const [folder, setFolder] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const created = await FeedsAPI.create({ url, folder: folder || undefined });
    setBusy(false);
    navigate(`/feeds/${created.id}`, { replace: true });
  };

  // @ts-ignore
  return (
    <AppShell>
      <PageHeader title="Ajouter un flux" subtitle="Colle une URL RSS/Atom. Nous détecterons la source." />
      <form onSubmit={onSubmit} className="max-w-xl grid gap-4">
        <div>
          <label className="text-sm text-neutral-700">URL du flux</label>
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemple.com/rss"
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Dossier (optionnel)</label>
          <input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Actualités, Tech…"
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
          />
        </div>
        <button
          disabled={busy}
          className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 font-medium hover:bg-emerald-900 disabled:opacity-60 transition"
        >
          {busy ? "Ajout…" : "Ajouter"}
        </button>
      </form>
    </AppShell>
  );
};

export default FeedNew;
