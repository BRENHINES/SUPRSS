// src/pages/collections/CollectionMembers.tsx
import React, { useEffect, useState } from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useParams } from "react-router-dom";
import { CollectionsAPI } from "@/services/app";

const CollectionMembers: React.FC = () => {
  const { id } = useParams();
  const [members, setMembers] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => { CollectionsAPI.members(Number(id)).then(setMembers); }, [id]);

  return (
    <AppShell>
      <PageHeader title="Membres" />
      <div className="grid gap-2">
        {members.map((m) => (
          <div key={m.id} className="rounded-xl bg-white border border-neutral-200 p-3">{m.name}</div>
        ))}
      </div>
    </AppShell>
  );
};
export default CollectionMembers;
