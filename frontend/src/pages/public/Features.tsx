import React from "react";
import { motion } from "framer-motion";
import { FiZap, FiLock, FiSearch, FiStar, FiShare2, FiBell } from "react-icons/fi";
import SideHeader from "@/components/layout/SiteHeader";
import SideFooter from "@/components/layout/SiteFooter";

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({id, className = "", children}) => (
  <section id={id} className={`py-24 md:py-24 ${className}`}>
    <div className="mx-auto w-full px-10 md:px-12 sm:px-12 lg:px-16 xl:px-24">{children}</div>
  </section>
);

const Card: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="rounded-2xl border border-emerald-900/20 bg-teal-700 p-6 hover:bg-emerald-950 transition">
    <div className="size-11 grid place-items-center rounded-xl bg-teal-800 text-emerald-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-emerald-100">{title}</h3>
    <p className="text-emerald-200/80 mt-2 text-sm leading-6">{desc}</p>
  </div>
);

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-950">
      <SideHeader />

      {/* Hero */}
      <Section className="bg-gradient-to-b from-emerald-900/40 to-transparent">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-neutral-50 px-3 py-1 text-xs font-medium text-emerald-500">
            Aperçu des fonctionnalités
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight">
            Maîtrise tes flux avec des outils
            <span className="text-emerald-500"> intelligents</span>
          </h1>
          <p className="mt-4 text-neutral-600">
            SUPRSS centralise, trie et recommande les articles qui comptent, pour ne rien manquer tout en
            gagnant du temps.
          </p>
        </div>
      </Section>

      {/* Grid */}
      <Section>
        <div className="grid md:grid-cols-3 gap-6">
          <Card icon={<FiZap size={22} />} title="Lecture rapide"
                desc="Résumé instantané, mode focus, raccourcis clavier pour parcourir à la vitesse de la lumière." />
          <Card icon={<FiSearch size={22} />} title="Recherche puissante"
                desc="Filtre par source, tag, date, statut (lu / étoilé), texte intégral avec surlignage." />
          <Card icon={<FiBell size={22} />} title="Alertes & digests"
                desc="Notifications sur mots-clés, récap quotidiens/hebdo des articles importants." />
          <Card icon={<FiStar size={22} />} title="Priorisation"
                desc="Classement intelligent, favoris, dossiers & collections partagées pour collaborer." />
          <Card icon={<FiShare2 size={22} />} title="Partage facile"
                desc="Export vers Notion/Slack/Trello, liens propres, capture de citations en 1 clic." />
          <Card icon={<FiLock size={22} />} title="Sécurité"
                desc="Sessions chiffrées, 2FA (bientôt), contrôle des appareils et révocation à la demande." />
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-gradient-to-b from-transparent to-emerald-900/40">
        <div className="text-center">
          <h3 className="text-2xl font-semibold">Prêt(e) à essayer SUPRSS ?</h3>
          <p className="text-emerald-600 mt-2">Créé pour les curieux, journalistes, chercheurs et makers.</p>
          <a
            href="/register"
            className="inline-flex items-center justify-center mt-6 rounded-xl bg-emerald-500 text-white font-medium px-5 py-3 hover:bg-emerald-600 hover:text-white transition"
          >
            Créer un compte gratuit
          </a>
        </div>
      </Section>

      <SideFooter />
    </div>
  );
};

export default Features;
