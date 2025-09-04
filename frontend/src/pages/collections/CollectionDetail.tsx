// src/pages/collections/CollectionDetail.tsx
import React, { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useParams, Link } from "react-router-dom";
import { CollectionsAPI, type Collection } from "@/services/app";

const CollectionDetail: React.FC = () => {
  const { id } = useParams();
  const [col, setCol] = useState<Collection | null>(null);

  useEffect(() => { CollectionsAPI.get(Number(id)).then(setCol); }, [id]);

  return (
    <AppShell>
      <PageHeader title={col?.name ?? "Collection"} right={<Link to={`/collections/${id}/members`} className="rounded-xl bg-white border border-neutral-200 px-4 py-2 hover:border-emerald-700 transition">Membres</Link>} />
      <div className="rounded-2xl bg-white border border-neutral-200 p-4">Contenu de la collection (à brancher)</div>
    </AppShell>
  );
};
export default CollectionDetail;
