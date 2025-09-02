import React from "react";
import PublicLayout from "@/layouts/PublicLayout";

const Features: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-semibold">Fonctionnalités</h1>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {[
            ["Collections", "Organisez vos flux en collections partagées ou privées."],
            ["Lecture hors ligne", "Marquez des articles à lire plus tard."],
            ["Raccourcis", "Naviguez au clavier pour aller plus vite."],
            ["Recherche", "Trouvez des articles par mots-clés."],
            ["Notifications", "Ne ratez pas les nouveaux articles."],
            ["Intégrations", "OPML, API, et plus à venir."],
          ].map(([title, desc]) => (
            <div key={title} className="border rounded-2xl p-6">
              <div className="font-medium">{title}</div>
              <p className="text-neutral-600 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Features;
