import React from "react";
import SideHeader from "@/components/layout/SiteHeader";
import SideFooter from "@/components/layout/SiteFooter";

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <section className={`py-24 md:py-28 ${className}`}>
    <div className="mx-auto w-full px-10 md:px-12 sm:px-12 lg:px-16 xl:px-24">{children}</div>
  </section>
);

const H2: React.FC<{ id?: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2 id={id} className="text-2xl md:text-3xl font-semibold text-emerald-900 mt-10">
    {children}
  </h2>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-3 text-emerald-950/90 leading-7">{children}</p>
);

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 text-emerald-900 overflow-x-hidden">
      <SideHeader />

      <Section className="bg-gradient-to-b from-emerald-900/10 to-transparent rounded-[16px]">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-semibold">Conditions d’utilisation</h1>
          <P>Ces conditions encadrent l’utilisation de SUPRSS. En créant un compte, vous les acceptez.</P>

          <H2 id="service">1. Service</H2>
          <P>
            SUPRSS permet d’agréger, lire et organiser des flux RSS. Certaines fonctionnalités peuvent évoluer
            au fil du temps.
          </P>

          <H2 id="compte">2. Compte & sécurité</H2>
          <P>
            Vous êtes responsable de la confidentialité de vos identifiants et des activités menées depuis
            votre compte. Prévenez-nous en cas d’accès non autorisé.
          </P>

          <H2 id="contenus">3. Contenus</H2>
          <P>
            Vous conservez les droits sur vos données (flux, collections, annotations). Vous vous engagez à ne
            pas utiliser SUPRSS pour diffuser des contenus illicites ou violer des droits tiers.
          </P>

          <H2 id="usage-acceptable">4. Usage acceptable</H2>
          <P>
            Pas de scraping abusif, DDoS, reverse engineering non autorisé, ni d’utilisation qui dégrade
            le service pour les autres utilisateurs.
          </P>

          <H2 id="resiliation">5. Résiliation</H2>
          <P>
            Vous pouvez supprimer votre compte à tout moment. Nous pouvons suspendre un compte en cas d’abus
            ou de non-respect des présentes conditions.
          </P>

          <H2 id="responsabilite">6. Responsabilité</H2>
          <P>
            SUPRSS est fourni « en l’état ». Nous ne garantissons pas l’absence totale d’erreurs. Notre
            responsabilité ne saurait excéder les montants éventuellement payés sur les 12 derniers mois.
          </P>

          <H2 id="donnees">7. Données personnelles</H2>
          <P>
            Le traitement de vos données est décrit dans la <a className="text-emerald-700 underline" href="/privacy">Politique de confidentialité</a>.
          </P>

          <H2 id="droit">8. Droit applicable</H2>
          <P>Droit français. Tribunal compétent : Paris, sous réserve des dispositions légales impératives.</P>

          <p className="mt-8 text-sm text-emerald-900/70">Version : 1.0 — Dernière mise à jour : {new Date().toLocaleDateString()}</p>
        </div>
      </Section>

      <SideFooter />
    </div>
  );
};

export default Terms;
