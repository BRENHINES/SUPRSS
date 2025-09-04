// src/components/ui/ErrorPage.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SideHeader from "@/components/layout/SiteHeader";
import SideFooter from "@/components/layout/SiteFooter";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";

type Props = {
  code: number | string;
  title: string;
  message?: string;
  /** Lien principal (sinon on fait un "retour" navigateur) */
  backTo?: string;
  /** Libellé du bouton principal (ex: "Recharger" pour Offline) */
  backLabel?: string;
  /** Bloc optionnel (détails, stack, etc.) */
  extra?: React.ReactNode;
};

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <section className={`py-24 md:py-28 ${className}`}>
    <div className="mx-auto w-full px-10 md:px-12 sm:px-12 lg:px-16 xl:px-24">{children}</div>
  </section>
);

const ErrorPage: React.FC<Props> = ({ code, title, message, backTo, backLabel, extra }) => {
  const navigate = useNavigate();

  // Si le libellé évoque un "reload", on force un refresh page (utile pour Offline)
  const wantsReload =
    (backLabel || "").toLowerCase().includes("recharg") ||
    (backLabel || "").toLowerCase().includes("reload");

  const Primary = () => {
    if (wantsReload) {
      return (
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 transition"
        >
          <FiRefreshCw className="shrink-0" />
          {backLabel || "Recharger"}
        </button>
      );
    }
    if (backTo) {
      return (
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 transition"
        >
          <FiArrowLeft className="shrink-0" />
          {backLabel || "Retour à l’accueil"}
        </Link>
      );
    }
    return (
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 transition"
      >
        <FiArrowLeft className="shrink-0" />
        Revenir en arrière
      </button>
    );
  };

  return (
  <div className="min-h-screen bg-neutral-50 text-emerald-950 flex flex-col">
    <Section className="bg-gradient-to-b from-emerald-900/5 via-transparent to-emerald-900/5 flex-1 flex items-center">
      <div className="grid md:grid-cols-[360px,1fr] gap-10 items-center w-full">
        {/* Carte code */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-700 p-10 text-white">
          <div className="absolute -top-16 -right-20 size-[260px] rounded-full border border-white/10" />
          <div className="absolute -bottom-10 -left-14 size-[220px] rounded-full border border-white/10" />
          <div className="text-6xl md:text-7xl font-bold tracking-tight drop-shadow-sm">{code}</div>
          <div className="mt-2 text-emerald-100">SUPRSS</div>
        </div>

        {/* Texte + actions */}
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">{title}</h1>
          {message && <p className="mt-3 text-neutral-600">{message}</p>}

          {extra && (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700 overflow-auto">
              {extra}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Primary />
            {/* Bouton "Recharger" secondaire si le principal n'est pas déjà un reload */}
            {!wantsReload && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/20 bg-white px-4 py-2.5 font-medium hover:border-emerald-700 transition"
              >
                <FiRefreshCw className="shrink-0" />
                Recharger
              </button>
            )}
          </div>
        </div>
      </div>
    </Section>
  </div>
);
};

export default ErrorPage;
