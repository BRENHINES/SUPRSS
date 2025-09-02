import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";

const Landing: React.FC = () => {
  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Votre lecteur RSS<br />simple et rapide.
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Centralisez vos sources, lisez sans distraction, restez à jour.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/register" className="px-5 py-3 rounded-lg bg-black text-white">Commencer</Link>
            <Link to="/features" className="px-5 py-3 rounded-lg border">Voir les fonctionnalités</Link>
          </div>
        </div>
        <div className="border rounded-2xl p-6 shadow-sm">
          <div className="h-64 bg-neutral-100 rounded-xl grid place-items-center">
            <span className="text-neutral-500">aperçu de l’app</span>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-6">
        {[
          { t: "Rapide", d: "Interface fluide, chargements instantanés." },
          { t: "Minimal", d: "Juste l’essentiel pour lire mieux." },
          { t: "Open", d: "Import/Export OPML, API prête." },
        ].map((f) => (
          <div key={f.t} className="border rounded-2xl p-6">
            <div className="text-lg font-medium">{f.t}</div>
            <p className="text-neutral-600 mt-2">{f.d}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
};

export default Landing;
