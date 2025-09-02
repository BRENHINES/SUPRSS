import React from "react";
import PublicLayout from "@/layouts/PublicLayout";

const Privacy: React.FC = () => (
  <PublicLayout>
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
      <h1 className="text-3xl font-semibold">Politique de confidentialité</h1>
      <p className="text-neutral-700">Dernière mise à jour : aujourd’hui (version démo).</p>
      <p className="text-neutral-700">Nous respectons vos données. Cette page est un placeholder.</p>
    </div>
  </PublicLayout>
);

export default Privacy;
