import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rss,
  Zap,
  BookOpenText,
  Share2,
  FolderTree,
  Search,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { DashboardMock, BarsCard, StatsBadge } from "@/components/BenefitArt";
import { IntegrationsOrbit, Item } from "@/components/IntegrationsCloud";
import { SiSlack, SiZapier, SiNotion, SiAirtable, SiGithub, SiPocket, SiTrello, SiTelegram } from "react-icons/si";


const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }>
    = ({ id, className = "", children,}) => (
  <section id={id} className={`py-28 md:py-40 ${className}`}>
    <div className="mx-auto w-full px-10 sm:px-12 lg:px-16 xl:px-24"> {children} </div>
  </section>
);


const Pill: React.FC<{ children: React.ReactNode }>=({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
    <Sparkles className="h-3.5 w-3.5" />{children}
  </span>
);

const Card: React.FC<{ children: React.ReactNode; dark?: boolean }>=({ children, dark }) => (
  <div className={`rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-black/5 ${dark ? "bg-teal-900 text-teal-50" : "bg-white"}`}>
    {children}
  </div>
);

const logos = [
  { src: "/integrations/airtable.svg", alt: "Airtable" },
  { src: "/integrations/notion.svg", alt: "Notion" },
  { src: "/integrations/slack.svg", alt: "Slack" },
  { src: "/integrations/jira.svg", alt: "Jira" },
  { src: "/integrations/linear.svg", alt: "Linear" },
  { src: "/integrations/zapier.svg", alt: "Zapier" },
  { src: "/integrations/segment.svg", alt: "Segment" },
  { src: "/integrations/plausible.svg", alt: "Plausible" },
];

export default function Landing() {
  return (
    <div className="bg-neutral-50 text-neutral-900">
      <SiteHeader />

      {/* HERO */}
      <main>
        {/* HERO */}
        <Section className="pt-28 md:pt-36">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <Pill>Le lecteur RSS moderne</Pill>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Suivez le web
                <span className="block text-teal-700">sans le bruit.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600">
                SUPRSS agrège vos sources, classe vos contenus et vous offre une
                lecture épurée. Rapide, collaboratif, et pensé pour les équipes.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-3 text-white shadow hover:bg-teal-800 hover:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-teal-400">
                  Commencer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/features" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-teal-700 ring-1 ring-inset ring-teal-200 hover:bg-teal-50 hover:text-emerald-900">
                  Voir les fonctionnalités
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-2 text-sm text-neutral-600">Noté 5.0 par nos premiers utilisateurs</span>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="grid grid-cols-2 gap-4">
              <Card>
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600/10">
                      <Rss className="h-6 w-6 text-teal-700" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">1000+ flux</h3>
                    <p className="mt-2 text-sm text-neutral-600">Ajoutez vos sources en un clic, ou importez votre OPML.</p>
                  </div>
                  <div className="mt-6 rounded-2xl bg-neutral-100 p-4 text-sm">Mise à jour en continu</div>
                </div>
              </Card>
              <Card dark>
                <h3 className="text-4xl font-semibold">195k+</h3>
                <p className="mt-2 text-teal-100">Articles synchronisés ce mois</p>
                <div className="mt-6 rounded-2xl bg-teal-800/40 p-4 text-sm">Préchargement pour lecture instantanée</div>
              </Card>
              <Card>
                <h3 className="text-4xl font-semibold"><span className="align-middle">6×</span></h3>
                <p className="mt-2 text-neutral-600">Plus rapide que votre boîte mail</p>
                <div className="mt-6 flex items-center gap-2 text-sm text-teal-700">
                  <Zap className="h-4 w-4" /> Push intelligent
                </div>
              </Card>
              <Card dark>
                <p className="text-sm text-teal-100">Productivité</p>
                <h3 className="mt-1 text-xl font-semibold">Lisez mieux, pas plus</h3>
                <p className="mt-2 text-teal-100/80">Filtres, recherche plein‑texte et favoris rapides.</p>
              </Card>
            </motion.div>
          </div>
        </Section>

        {/* SERVICES / FEATURES GRID */}
        <Section className="bg-teal-900 text-teal-50">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Des fonctionnalités efficaces et intégrées</h2>
          <p className="mt-3 text-teal-100">
            Simplifiez votre veille avec notre suite d'outils axée qualité.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <Rss className="h-5 w-5" />, title: "Agrégation ultra‑rapide", text: "Récupération parallèle, déduplication et normalisation." },
            { icon: <BookOpenText className="h-5 w-5" />, title: "Lecture propre", text: "Vue article épurée, polices lisibles, mode sombre." },
            { icon: <FolderTree className="h-5 w-5" />, title: "Collections & équipes", text: "Organisez par dossiers, partagez avec votre équipe." },
            { icon: <Search className="h-5 w-5" />, title: "Recherche plein‑texte", text: "Trouvez instantanément titres, auteurs et contenus." },
            { icon: <Share2 className="h-5 w-5" />, title: "Partage facile", text: "Envoyez vers Slack, mail, ou exportez en OPML." },
            { icon: <ShieldCheck className="h-5 w-5" />, title: "Confidentialité", text: "Vos données vous appartiennent. Export simple." },
          ].map((f, i) => (
            <motion.div key={i} {...fadeUp} className="rounded-3xl bg-teal-800/30 p-6 ring-1 ring-inset ring-white/10">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700/20">{f.icon}</div>
                <ArrowRight className="h-4 w-4 opacity-60" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-teal-100/80">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

        {/* BENEFITS */}
        <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div {...fadeUp} className="order-2 lg:order-1">
            <h2 className="text-3xl font-semibold sm:text-4xl">Les bénéfices clés pour votre veille</h2>
            <p className="mt-4 text-neutral-600">
              Nos systèmes augmentent la productivité, réduisent le bruit et vous aident à
              capter l'essentiel.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { title: "Priorité au signal", text: "Filtrez par source, mot‑clé et réputation." },
                { title: "Moins de friction", text: "Tout est optimisé pour la lecture rapide." },
                { title: "Toujours à jour", text: "Synchronisation continue et notifications." },
              ].map((b, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-teal-900">
                    <CheckIcon />
                  </div>
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-sm text-neutral-600">{b.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="rounded-2xl bg-neutral-100 p-5">
                <DashboardMock />
                <div className="grid md:grid-cols-2 gap-4">
                  <BarsCard />
                  <StatsBadge />
                </div>
              </div>
              <div className="-mt-8 ml-auto w-64 rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
                <p className="text-sm font-medium">Total articles ce mois</p>
                <p className="mt-1 text-3xl font-semibold">1951+</p>
                <p className="mt-1 text-xs text-emerald-600">+8% vs mois dernier</p>
              </div>
            </div>
          </motion.div>
        </div>

      </Section>

        {/* SECTION FONCÉE (style “services”) */}
        <section className="w-full bg-teal-900 text-teal-50">
          <div className="container mx-auto px-4 md:px-6 py-16">
            <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-semibold text-center">
              Efficace et intégré
            </motion.h2>
            <motion.p {...fadeUp} className="mt-3 text-center text-emerald-100/80 max-w-2xl mx-auto">
              SUPRSS automatise la collecte et la mise à jour des contenus, et s’intègre à vos outils.
            </motion.p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                  ["Import OPML", "Reprenez vos flux existants en un clic."],
                  ["Filtres & Dossiers", "Organisez comme vous voulez, sans friction."],
                  ["Intégrations", "Zapier, Slack (bientôt), export JSON/CSV."],
                  ["Sauvegardes", "Articles étoilés et « à lire plus tard »."],
                  ["Raccourcis", "Navigation clavier et lecture rapide."],
                  ["Mobile-ready", "Design responsive, PWA (bientôt)."],
                  ["Rassemblez tout", "Flux RSS, newsletters, YouTube, X… au même endroit."],
                  ["Sans distraction", "Mode lecture propre, tri par priorité, batch-read."],
                  ["Recherche instantanée", "Retrouvez n’importe quel article en quelques ms."],
              ].map(([t, d]) => (
                <motion.div
                  key={t}
                  {...fadeUp}
                  className="rounded-xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="text-lg font-semibold">{t}</div>
                  <p className="mt-1 text-emerald-100/80">{d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRATIONS STRIP */}
        <Section className="bg-teal-50">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-semibold sm:text-4xl">S'intègre à vos outils</h2>
            <p className="mt-3 max-w-xl text-neutral-700">
              Export OPML, webhooks simples et API REST. Connectez SUPRSS à votre
              stack (Slack, Notion, Zapier…).
            </p>
            <Link to="/help" className="mt-6 inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-white shadow hover:bg-emerald-700">
              Voir comment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div {...fadeUp} className="rounded-3xl bg-emerald-600 p-10">
            <IntegrationsOrbit>
              <Item label="Slack"><SiSlack size={22} /></Item>
              <Item label="Zapier"><SiZapier size={22} /></Item>
              <Item label="Notion"><SiNotion size={22} /></Item>
              <Item label="Airtable"><SiAirtable size={22} /></Item>
              <Item label="GitHub"><SiGithub size={22} /></Item>
              <Item label="Pocket"><SiPocket size={22} /></Item>
              <Item label="Trello"><SiTrello size={22} /></Item>
              <Item label="Telegram"><SiTelegram size={22} /></Item>
            </IntegrationsOrbit>
          </motion.div>
        </div>
      </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

// ---------- tiny inline icon (check) so we don't need another lib ----------
const CheckIcon = () => (
  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-emerald-700">
    <path d="M7.5 13.1 3.9 9.5l-1.4 1.4 5 5 10-10-1.4-1.4z" />
  </svg>
);
