// src/pages/collections/CollectionNew.tsx
import React, { useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { CollectionsAPI } from "@/services/app";
import { useNavigate } from "react-router-dom";

const CollectionNew: React.FC = () => {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const c = await CollectionsAPI.create({ name });
    setBusy(false);
    navigate(`/collections/${c.id}`, { replace: true });
  };

  return (
    <AppShell>
      <PageHeader title="Créer une collection" />
      <form onSubmit={onSubmit} className="max-w-xl grid gap-4">
        <div>
          <label className="text-sm text-neutral-700">Nom</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
          />
        </div>
        <button disabled={busy} className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 font-medium hover:bg-emerald-900 disabled:opacity-60 transition">
          {busy ? "Création…" : "Créer"}
        </button>
      </form>
    </AppShell>
  );
};
export default CollectionNew;
