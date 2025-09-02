import React from "react";
import PublicLayout from "@/layouts/PublicLayout";

const About: React.FC = () => (
  <PublicLayout>
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold">À propos</h1>
      <p className="mt-4 text-neutral-700 leading-relaxed">
        SUPRSS est un lecteur RSS moderne conçu pour une lecture concentrée et efficace.
        Notre objectif : simplicité, performance, accessibilité.
      </p>
    </div>
  </PublicLayout>
);

export default About;
