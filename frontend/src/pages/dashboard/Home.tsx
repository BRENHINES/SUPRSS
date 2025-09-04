// src/pages/app/Home.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import AppShell from "@/components/common/AppShell";        // ⬅️ on enveloppe la page
import { useAuth } from "@/auth/AuthContext";
import { isOnboarded } from "@/services/storage";
import {
  FiPlus, FiUpload, FiCompass, FiFolderPlus, FiRss, FiStar, FiBookmark,
  FiClock, FiArrowRight, FiZap, FiBell, FiSettings, FiMenu
} from "react-icons/fi";

// ---------- Helpers (mock data + utils) ----------
type Article = { id: string; title: string; source: string; date: string; unread?: boolean };
type Feed = { id: string; name: string; unread: number };
type Collection = { id: string; name: string; count: number };

const mockArticles: Article[] = [
  { id: "a1", title: "AI & Productivité : 7 flux à suivre", source: "Numérama", date: "2025-09-01", unread: true },
  { id: "a2", title: "Apple réinvente l’agrégation avec...", source: "The Verge", date: "2025-09-01", unread: true },
  { id: "a3", title: "Guide : OPML, import parfait", source: "SUPRSS Blog", date: "2025-08-31" },
  { id: "a4", title: "UX patterns pour lecteurs RSS", source: "Smashing Mag", date: "2025-08-30" },
  { id: "a5", title: "Tendances veille 2025", source: "Medium", date: "2025-08-30" },
  { id: "a6", title: "Notion + RSS : workflow", source: "Notion Tips", date: "2025-08-29" },
];

const mockFeeds: Feed[] = [
  { id: "f1", name: "Tech / The Verge", unread: 12 },
  { id: "f2", name: "Design / Smashing", unread: 4 },
  { id: "f3", name: "Product / Lenny", unread: 7 },
  { id: "f4", name: "Data / KDnuggets", unread: 3 },
  { id: "f5", name: "AI / Hugging Face", unread: 11 },
  { id: "f6", name: "Business / Stratechery", unread: 2 },
];

const mockCollections: Collection[] = [
  { id: "c1", name: "IA à lire", count: 18 },
  { id: "c2", name: "Design System", count: 9 },
  { id: "c3", name: "Veille produit", count: 14 },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

// ---------- UI primitives ----------
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-emerald-900/10 bg-white shadow-sm ${className}`}>{children}</div>
);

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <Card className="p-5">
    <div className="flex items-center gap-3">
      <div className="grid place-items-center size-10 rounded-xl bg-emerald-50 text-emerald-700">{icon}</div>
      <div>
        <div className="text-sm text-neutral-500">{label}</div>
        <div className="text-xl font-semibold text-teal-900">{value}</div>
      </div>
    </div>
  </Card>
);

const Section: React.FC<{ title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  action,
  children,
  className = "",
}) => (
  <section className={`px-6 sm:px-8 lg:px-12 xl:px-16 py-6 ${className}`}>
    {(title || action) && (
      <div className="mb-4 flex items-center justify-between">
        {title ? <h2 className="text-lg font-semibold text-teal-900">{title}</h2> : <div />}
        {action}
      </div>
    )}
    {children}
  </section>
);

// ---------- Components ----------
const OnboardingBanner: React.FC<{ name?: string }> = ({ name }) => (
  <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-r from-emerald-50 to-white p-5 sm:p-6 flex items-start justify-between gap-4">
    <div>
      <div className="text-sm text-emerald-700 font-medium">Bienvenue{ name ? `, ${name}` : "" } 👋</div>
      <p className="text-teal-900 mt-1">
        Terminez l’onboarding pour une expérience aux petits oignons : importez votre OPML, suivez des sources,
        activez les intégrations.
      </p>
      <div className="mt-3 flex gap-2">
        <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
          Démarrer
          <FiArrowRight />
        </Link>
        <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg border border-emerald-900/10 bg-white px-3 py-2 hover:bg-emerald-50">
          Explorer les sources
        </Link>
      </div>
    </div>
    <div className="hidden sm:block text-emerald-600">
      <FiZap size={24} />
    </div>
  </div>
);

const QuickActions: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Link to="/feeds/new" className="rounded-xl border border-emerald-900/10 bg-white p-4 hover:bg-emerald-50 transition">
      <div className="text-emerald-700"><FiPlus /></div>
      <div className="mt-2 font-medium text-teal-900">Nouveau flux</div>
      <div className="text-sm text-neutral-500">Ajoutez une URL RSS</div>
    </Link>
    <Link to="/settings/integrations" className="rounded-xl border border-emerald-900/10 bg-white p-4 hover:bg-emerald-50 transition">
      <div className="text-emerald-700"><FiUpload /></div>
      <div className="mt-2 font-medium text-teal-900">Importer OPML</div>
      <div className="text-sm text-neutral-500">Depuis un autre lecteur</div>
    </Link>
    <Link to="/explore" className="rounded-xl border border-emerald-900/10 bg-white p-4 hover:bg-emerald-50 transition">
      <div className="text-emerald-700"><FiCompass /></div>
      <div className="mt-2 font-medium text-teal-900">Explorer</div>
      <div className="text-sm text-neutral-500">Sources recommandées</div>
    </Link>
    <Link to="/collections/new" className="rounded-xl border border-emerald-900/10 bg-white p-4 hover:bg-emerald-50 transition">
      <div className="text-emerald-700"><FiFolderPlus /></div>
      <div className="mt-2 font-medium text-teal-900">Nouvelle collection</div>
      <div className="text-sm text-neutral-500">Organisez & partagez</div>
    </Link>
  </div>
);

const RecentArticles: React.FC<{ items: Article[] }> = ({ items }) => (
  <Card>
    <ul className="divide-y divide-emerald-900/10">
      {items.slice(0, 6).map((a) => (
        <li key={a.id} className="p-4 hover:bg-emerald-50/60 transition">
          <Link to={`/articles/${a.id}`} className="grid sm:grid-cols-[1fr,180px,120px] gap-2 items-center">
            <div className="min-w-0">
              <div className="truncate font-medium text-teal-900">
                {a.title} {a.unread && <span className="ml-2 inline-block align-middle rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">non lu</span>}
              </div>
              <div className="text-sm text-neutral-500 mt-0.5">{a.source}</div>
            </div>
            <div className="text-sm text-neutral-500 hidden sm:block">{formatDate(a.date)}</div>
            <div className="justify-self-end text-emerald-600 hidden sm:inline-flex items-center gap-1">
              Lire <FiArrowRight />
            </div>
          </Link>
        </li>
      ))}
    </ul>
    <div className="p-3 border-t border-emerald-900/10 text-right">
      <Link to="/app" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
        Voir tout <FiArrowRight />
      </Link>
    </div>
  </Card>
);

const FeedsPreview: React.FC<{ items: Feed[] }> = ({ items }) => (
  <Card>
    <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.slice(0, 6).map((f) => (
        <Link key={f.id} to={`/feeds/${f.id}`} className="rounded-xl border border-emerald-900/10 p-3 hover:bg-emerald-50/60 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center size-8 rounded-lg bg-emerald-600/10 text-emerald-700">
                <FiRss />
              </div>
              <div className="font-medium text-teal-900 truncate">{f.name}</div>
            </div>
            <span className="text-sm rounded-lg bg-emerald-100 text-emerald-700 px-2 py-0.5">{f.unread}</span>
          </div>
        </Link>
      ))}
    </div>
    <div className="p-3 border-t border-emerald-900/10 text-right">
      <Link to="/feeds" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
        Tous les flux <FiArrowRight />
      </Link>
    </div>
  </Card>
);

const CollectionsPreview: React.FC<{ items: Collection[] }> = ({ items }) => (
  <Card>
    <div className="p-4 grid md:grid-cols-3 gap-3">
      {items.slice(0, 3).map((c) => (
        <Link key={c.id} to={`/collections/${c.id}`} className="rounded-xl border border-emerald-900/10 p-3 hover:bg-emerald-50/60 transition">
          <div className="font-medium text-teal-900">{c.name}</div>
          <div className="text-sm text-neutral-500 mt-1">{c.count} articles</div>
        </Link>
      ))}
    </div>
    <div className="p-3 border-t border-emerald-900/10 text-right">
      <Link to="/collections" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
        Toutes les collections <FiArrowRight />
      </Link>
    </div>
  </Card>
);

const TipsAndIntegrations: React.FC = () => (
  <div className="grid md:grid-cols-2 gap-4">
    <Card>
      <div className="p-4">
        <div className="text-sm font-semibold text-teal-900">Astuces</div>
        <ul className="mt-2 space-y-1.5 text-sm text-neutral-600">
          <li><b>/</b> : focus recherche globale</li>
          <li><b>N</b> : ajouter un nouveau flux</li>
          <li><b>F</b> : aller aux flux — <b>G</b> puis <b>F</b></li>
          <li><b>S</b> : ouvrir la recherche</li>
        </ul>
      </div>
    </Card>

    <Card>
      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-teal-900">Intégrations</div>
          <p className="text-sm text-neutral-600 mt-1">
            Connectez Slack, Notion, Pocket… pour partager et automatiser.
          </p>
          <Link
            to="/settings/integrations"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-900/10 bg-white px-3 py-2 hover:bg-emerald-50"
          >
            <FiSettings /> Ouvrir les intégrations
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-emerald-700">
          <FiBell /><FiStar /><FiBookmark />
        </div>
      </div>
    </Card>
  </div>
);

// ---------- Page ----------
const Home: React.FC = () => {
  const { user } = useAuth();

  const totals = useMemo(() => {
    const unread = mockArticles.filter(a => a.unread).length + mockFeeds.reduce((s, f) => s + f.unread, 0);
    return {
      unread,
      starred: 8,       // TODO brancher stats réelles
      today: 5,         // TODO
      trending: 12,     // TODO
    };
  }, []);

  const showOnboarding = user ? !isOnboarded(user.id) : false;

  return (
    <AppShell>
      {/* Top row with burger */}
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-teal-900">Accueil</h1>
            <p className="text-neutral-600">Vue d’ensemble de votre veille</p>
          </div>
          <button
            aria-label="Ouvrir le menu"
            onClick={() => document.dispatchEvent(new CustomEvent("appshell:toggle"))}
            className="sm:hidden inline-flex items-center justify-center size-10 rounded-xl border border-emerald-900/10 text-emerald-700 hover:bg-emerald-50"
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* Bandeau onboarding + actions rapides */}
      <Section className="pt-2">
        <div className="grid gap-4">
          {showOnboarding && <OnboardingBanner name={user?.username || user?.email?.split("@")[0]} />}
          <QuickActions />
        </div>
      </Section>

      {/* Stats */}
      <Section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={<FiBookmark />} label="Non lus" value={totals.unread} />
          <Stat icon={<FiStar />} label="Étoilés" value={totals.starred} />
          <Stat icon={<FiClock />} label="Aujourd’hui" value={totals.today} />
          <Stat icon={<FiZap />} label="Tendance" value={totals.trending} />
        </div>
      </Section>

      {/* Récents & Flux */}
      <Section>
        <div>
          <div className="grid gap-4">
            <h3 className="text-base font-semibold text-teal-900">À lire / Récents</h3>
            <RecentArticles items={mockArticles} />
          </div>
        </div>
      </Section>
    </AppShell>
  );
};

export default Home;
