import React, { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import SideHeader from "@/components/layout/SiteHeader";
import SideFooter from "@/components/layout/SiteFooter";

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <section className={`py-24 md:py-28 ${className}`}>
    <div className="mx-auto w-full px-10 md:px-12 sm:px-12 lg:px-16 xl:px-24">{children}</div>
  </section>
);

type QA = { q: string; a: string };

const CATEGORIES: Record<string, QA[]> = {
  "Général": [
    {
      q: "Qu’est-ce que SUPRSS ?",
      a: "SUPRSS est un lecteur RSS moderne qui centralise tes sources (blogs, médias, newsletters RSS), t’aide à découvrir de nouveaux flux, classe ce qui est important, et te permet de lire, sauvegarder, partager et collaborer facilement. L’app est rapide, respectueuse de la vie privée et pensée pour un usage quotidien."
    },
    {
      q: "À qui s’adresse SUPRSS ?",
      a: "Journalistes, veilleurs, chercheurs, product managers, devs, créateurs de contenu ou toute personne qui suit beaucoup de sources. Si tu te bats avec des dizaines d’onglets ou la boîte mail pour suivre l’actualité, SUPRSS simplifie radicalement ta veille."
    },
    {
      q: "SUPRSS est-il gratuit ?",
      a: "Oui. Le cœur du produit (ajout de flux, lecture, recherche, sauvegarde, collections, import/export OPML) est gratuit. Certaines intégrations avancées ou automatisations pourront arriver plus tard, mais tu peux utiliser SUPRSS sans payer."
    },
    {
      q: "Sur quels navigateurs et appareils SUPRSS fonctionne-t-il ?",
      a: "Navigateur desktop et mobile récents (Chrome, Edge, Firefox, Safari). L’interface est responsive et peut s’installer en raccourci type PWA (Ajouter à l’écran d’accueil) pour un accès rapide."
    }
  ],

  "Compte & Connexion": [
    {
      q: "Comment créer un compte ?",
      a: "Inscris-toi avec un email et un mot de passe, ou utilise OAuth (Google / GitHub) quand il sera disponible sur ton instance. Un email de vérification peut être envoyé selon la configuration du backend."
    },
    {
      q: "Je n’arrive pas à me connecter, que faire ?",
      a: "Vérifie l’email et le mot de passe, essaie la réinitialisation si besoin. Si tu utilises un gestionnaire de mots de passe, assure-toi de la bonne URL. Enfin, vide le cache du navigateur et réessaie ; si le problème persiste, écris-nous : help@suprss.com."
    },
    {
      q: "Puis-je utiliser SUPRSS sans vérifier mon email ?",
      a: "La plupart des fonctions marchent, mais la vérification est recommandée pour la récupération de compte et certaines opérations sensibles. Clique le lien reçu par email pour valider."
    },
    {
      q: "Comment me déconnecter de tous mes appareils ?",
      a: "Depuis Paramètres → Sécurité (ou le menu profil), utilise « Se déconnecter de partout ». Le backend invalide tes jetons de rafraîchissement actifs."
    }
  ],

  "Flux & Abonnements": [
    {
      q: "Comment ajouter un flux RSS ?",
      a: "Bouton « Ajouter un flux » → colle l’URL du flux (ou du site si l’auto-découverte est possible) → Valider. SUPRSS récupère les métadonnées et commence à indexer les articles."
    },
    {
      q: "Je ne trouve pas l’URL RSS d’un site, des conseils ?",
      a: "Essaie https://site.tld/feed, /rss, /atom.xml ; ou inspecte le code source (balise link rel='alternate' type='application/rss+xml'). Beaucoup de sites exposent l’URL depuis leur footer ou page blog."
    },
    {
      q: "Comment organiser mes flux ?",
      a: "Utilise les collections (dossiers partagés ou personnels) et des tags. Tu peux aussi trier par popularité, date d’ajout ou activité récente selon les vues disponibles."
    },
    {
      q: "Combien de flux puis-je suivre ?",
      a: "Autant que tu veux dans la limite raisonnable des quotas de ton instance. Par défaut, SUPRSS limite le nombre d’articles ingérés par flux pour garder l’app rapide (ex. 1000 derniers articles/flux)."
    }
  ],

  "Lecture & Productivité": [
    {
      q: "Comment lire efficacement ?",
      a: "Ouvre un article en mode lecteur propre, navigue au clavier (J/K suivant/précédent, S pour étoiler, M pour marquer lu), et utilise la file d’attente « À lire plus tard ». La vue Focus masque la sidebar pour se concentrer."
    },
    {
      q: "Puis-je sauvegarder et classer des articles ?",
      a: "Oui : ajoute aux favoris (étoile), sauvegarde dans « À lire plus tard », ou déplace dans une collection. Tu peux aussi ajouter des notes ou tags selon ta configuration."
    },
    {
      q: "Comment retrouver un article rapidement ?",
      a: "Utilise la recherche (titre, contenu, source, tag, période). Les filtres « Lu/Non lu », « Étoilé », « Source » et « Collection » te permettent d’affiner instantanément."
    },
    {
      q: "Puis-je partager un article ?",
      a: "Bouton Partager → copie un lien propre, ou envoie vers Slack/Notion/Trello via les intégrations disponibles. Tu peux aussi exporter un lot d’articles sélectionnés."
    }
  ],

  "Collections & Collaboration": [
    {
      q: "Qu’est-ce qu’une collection ?",
      a: "Un espace logique pour regrouper des flux et/ou des articles. Personnel ou partagé, idéal pour un thème de veille, un projet produit, une équipe ou un client."
    },
    {
      q: "Comment partager une collection ?",
      a: "Crée une collection, puis « Inviter » en indiquant l’email des membres. Tu peux définir des rôles (lecture seule / contributeur) selon ta politique."
    },
    {
      q: "Peut-on commenter ou annoter des articles ?",
      a: "Oui si l’instance l’active : chaque article peut recevoir des commentaires internes pour contextualiser la veille et capitaliser les échanges."
    },
    {
      q: "Puis-je suivre l’activité d’une collection ?",
      a: "Oui, via la page de collection : nouveaux articles, éléments étoilés, ajouts/suppressions de flux… Des résumés périodiques peuvent être envoyés par email."
    }
  ],

  "Import / Export": [
    {
      q: "Comment importer mes abonnements (OPML) ?",
      a: "Paramètres → Import OPML → dépose ton fichier exporté depuis ton ancien lecteur. SUPRSS crée les flux correspondants et, si possible, conserve ta structure de dossiers."
    },
    {
      q: "Comment exporter mes flux ?",
      a: "Paramètres → Export OPML → télécharge le fichier. Tu peux le réutiliser ailleurs ou le versionner pour garder un snapshot de ta veille."
    },
    {
      q: "Mon OPML contient des centaines de flux, des limites ?",
      a: "L’import est asynchrone. Un indicateur de progression s’affiche ; les flux invalides sont listés à la fin avec la raison du rejet (HTTP, format, etc.)."
    },
    {
      q: "Puis-je exporter une sélection d’articles ?",
      a: "Oui : depuis une liste, sélectionne puis exporte en CSV/Markdown (si activé). Pratique pour des newsletters, des rapports ou un partage interne."
    }
  ],

  "Notifications & Rappels": [
    {
      q: "Puis-je recevoir des alertes sur des mots-clés ?",
      a: "Crée une alerte (ex. « IA générative ») avec des règles de sources et une fréquence. Tu recevras un digest par email et/ou une notification navigateur si autorisées."
    },
    {
      q: "Qu’est-ce qu’un digest ?",
      a: "Un récapitulatif (quotidien/hebdo) des articles marquants : nouveaux favoris, sources les plus actives, tendances de lecture. Tu peux en créer plusieurs par thème."
    },
    {
      q: "Comment éviter d’être spammé ?",
      a: "Ajuste la fréquence, définis des seuils (ex. minimum 3 articles), regroupe par source, et utilise la plage silencieuse. Tout est désactivable en un clic."
    },
    {
      q: "Les notifications push fonctionnent-elles sur mobile ?",
      a: "Oui via le navigateur mobile compatible. Autorise les notifications pour SUPRSS ; autrement, utilise les digests email."
    }
  ],

  "Intégrations": [
    {
      q: "Comment partager vers Slack ?",
      a: "Le plus simple : copie le lien d’article et colle-le dans Slack (aperçu riche). Pour automatiser, connecte SUPRSS à un Webhook Slack (ou via Zapier/Make) pour pousser les nouveaux articles d’un flux/collection vers un canal."
    },
    {
      q: "SUPRSS et Notion ?",
      a: "Tu peux coller un lien d’article dans une base Notion (bookmark) ou automatiser via Zapier/Make : nouveau billet RSS → créer une page dans une base (titre, URL, résumé, tags)."
    },
    {
      q: "Puis-je envoyer vers Trello ?",
      a: "Oui via automatisation : RSS → Carte Trello dans la bonne liste avec le lien, l’extrait et des labels. Pratique pour traiter la veille comme un backlog."
    },
    {
      q: "Pocket / Telegram / GitHub ?",
      a: "Pocket : enregistre l’URL depuis le bouton partage ou une automatisation. Telegram : envoie automatiquement dans un canal privé via bot. GitHub : utile pour créer des issues à partir d’articles (ex. idées produit)."
    }
  ],

  "Sécurité & Confidentialité": [
    {
      q: "Quelles données personnelles stockez-vous ?",
      a: "Email, nom d’utilisateur, hash du mot de passe (jamais en clair), préférences et activités (flux suivis, articles lus/étoilés). Les contenus d’articles sont indexés pour la recherche. Pas de revente de données."
    },
    {
      q: "Mes mots de passe sont-ils protégés ?",
      a: "Oui, hashés avec un algorithme sécurisé côté serveur. Les tokens d’accès ont une durée limitée ; les tokens de rafraîchissement peuvent être révoqués."
    },
    {
      q: "Puis-je supprimer mon compte et mes données ?",
      a: "Oui, via Paramètres → Compte → Supprimer mon compte. Les avatars/ressources associés sont également retirés du stockage. Tu peux exporter tes flux avant."
    },
    {
      q: "Conformité RGPD ?",
      a: "SUPRSS respecte les droits d’accès, de rectification et d’effacement. Contacte privacy@suprss.com pour toute demande liée aux données personnelles."
    }
  ],

  "Dépannage": [
    {
      q: "Un flux ne se met plus à jour.",
      a: "Le flux peut être en erreur (HTTP, CORS, format invalide). Ouvre les détails du flux pour voir la dernière erreur et réessaie. Si l’URL a changé, remets-la à jour. Certains sites limitent la fréquence : laisse un peu de temps."
    },
    {
      q: "Je vois une page vide ou un style cassé.",
      a: "Vide le cache et recharge. Vérifie qu’aucune extension (bloqueur de contenu) ne casse les requêtes. Essaie en navigation privée ; si OK, ajoute SUPRSS à la liste blanche."
    },
    {
      q: "Recherche lente sur une très grosse base.",
      a: "Réduis la période (ex. 30 jours), filtre par source/collection, et évite les jokers trop larges. L’indexation se fait par batch : juste après un import massif, la recherche peut être encore en train de s’optimiser."
    },
    {
      q: "Je n’arrive pas à importer mon OPML.",
      a: "Vérifie l’encodage UTF-8 et la structure du fichier. Les erreurs détaillées s’affichent en fin d’import (URLs invalides, flux indisponibles). Tu peux importer en plusieurs fois si besoin."
    }
  ]
};

const Item: React.FC<QA> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-emerald-900/30">
      <button
        className="w-full flex items-center justify-between py-4 text-left bg-teal-700"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="font-medium text-white">{q}</span>
        <span className="text-white">{open ? <FiMinus /> : <FiPlus />}</span>
      </button>
      {open && <p className="pb-5 pt-5 pl-5 text-neutral-50">{a}</p>}
    </div>
  );
};

const Help: React.FC = () => {
  const [active, setActive] = useState(Object.keys(CATEGORIES)[0]);
  return (
    <div className="min-h-screen bg-neutral-50 text-emerald-500">
      <SideHeader />

      <Section>
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-emerald-900">FAQ</h1>
          <p className="mt-3 text-emerald-950">Tes questions, nos réponses.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-[220px,1fr] gap-8">
          {/* Sidebar */}
          <aside className="rounded-2xl p-3">
            <ul className="space-y-1">
              {Object.keys(CATEGORIES).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setActive(cat)}
                    className={`w-full text-left rounded-xl px-3 py-2 transition ${
                      active === cat
                        ? "text-emerald-700 bg-neutral-50"
                        : "hover:text-emerald-800 bg-neutral-50"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <div className="rounded-2xl bg-teal-900 p-4 md:p-6">
            <h2 className="text-3xl font-semibold text-white">{active}</h2>
            <div className="mt-4 space-y-2">
              {CATEGORIES[active].map((qa) => (
                <Item key={qa.q} {...qa} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <SideFooter />
    </div>
  );
};

export default Help;
