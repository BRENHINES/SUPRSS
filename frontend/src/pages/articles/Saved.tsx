// src/pages/Saved.tsx
import React from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";

const Saved: React.FC = () => (
  <AppShell>
    <PageHeader title="Enregistrés" subtitle="Vos articles sauvegardés" />
    <div className="px-6 sm:px-8 lg:px-12 xl:px-16 pb-10">
      <div className="rounded-2xl bg-white border border-neutral-200 p-4">À brancher</div>
    </div>
  </AppShell>
);
export default Saved;
