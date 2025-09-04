// src/pages/collections/CollectionsList.tsx
import React, { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Link, useNavigate } from "react-router-dom";
import { CollectionsAPI, type Collection } from "@/services/app";
import { FiPlus } from "react-icons/fi";

const CollectionsList: React.FC = () => {
  const [items, setItems] = useState<Collection[]>([]);
  const navigate = useNavigate();

  useEffect(() => { CollectionsAPI.list().then(setItems); }, []);

  return (
    <AppShell>
      <PageHeader
        title="Collections"
        right={
          <button
            onClick={() => navigate("/collections/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2 hover:bg-emerald-900 transition"
          >
            <FiPlus /> Nouvelle collection
          </button>
        }
      />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((c) => (
          <Link key={c.id} to={`/collections/${c.id}`} className="rounded-2xl bg-white border border-neutral-200 p-4 hover:border-emerald-600 transition block">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-neutral-600 mt-1">{c.members ?? 0} membres</div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
};
export default CollectionsList;
