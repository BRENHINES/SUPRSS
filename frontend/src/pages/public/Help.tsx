import React, { useState } from "react";
import PublicLayout from "@/layouts/PublicLayout";

const QA = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl p-4">
      <button className="w-full text-left font-medium" onClick={() => setOpen(!open)}>
        {q}
      </button>
      {open && <p className="mt-2 text-neutral-600">{a}</p>}
    </div>
  );
};

const Help: React.FC = () => (
  <PublicLayout>
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
      <h1 className="text-3xl font-semibold">Aide / FAQ</h1>
      <QA q="Comment ajouter un flux ?" a="Cliquez sur 'Nouveau flux' puis collez l'URL RSS." />
      <QA q="Puis-je importer un OPML ?" a="Oui, via la page Import dans l’application." />
      <QA q="Le service est-il gratuit ?" a="Oui." />
    </div>
  </PublicLayout>
);

export default Help;
