// src/pages/ArticleReader.tsx
import React from "react";
import AppShell from "@/components/common/AppShell";
import PageHeader from "@/components/layout/PageHeader";

const ArticleReader: React.FC = () => {
  return (
    <AppShell>
      <PageHeader title="Lecture" subtitle="Titre de l’article" />
      <article className="prose max-w-none bg-white p-6 rounded-2xl border border-neutral-200">
        <h2>Exemple d’article</h2>
        <p>Contenu… (à brancher)</p>
      </article>
    </AppShell>
  );
};
export default ArticleReader;
