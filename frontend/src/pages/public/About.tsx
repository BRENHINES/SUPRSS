import React from "react";
import SideHeader from "@/components/layout/SiteHeader";
import SideFooter from "@/components/layout/SiteFooter";

const Section: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <section className={`py-24 md:py-28 ${className}`}>
    <div className="mx-auto w-full px-10 md:px-12 sm:px-12 lg:px-16 xl:px-24">{children}</div>
  </section>
);

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-emerald-500">
      <SideHeader />

      <Section>
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-emerald-900">À propos de SUPRSS</h1>
          <p className="mt-4 text-emerald-900">
            SUPRSS est un lecteur RSS moderne et rapide conçu pour t’aider à suivre l’essentiel, à
            collaborer, et à partager tes trouvailles en quelques secondes.
          </p>
        </div>
      </Section>

      <Section className="bg-teal-700">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-4xl font-semibold text-white">Notre mission</h2>
            <p className="mt-3 text-emerald-200/80">
              Réduire le bruit d’information et augmenter le signal. Nous pensons que la veille doit être
              agréable, collaborative et respectueuse de la vie privée.
            </p>
          </div>
          <div>
            <h2 className="text-4xl font-semibold text-white">Comment ça marche&nbsp;?</h2>
            <p className="mt-3 text-emerald-200/80">
              Ajoute tes flux, classe tes articles, mets en favoris et reçois des alertes ciblées. Partage
              facilement vers Slack/Notion/Trello, ou exporte en OPML quand tu veux.
            </p>
          </div>
        </div>
      </Section>

      <SideFooter />
    </div>
  );
};

export default About;
