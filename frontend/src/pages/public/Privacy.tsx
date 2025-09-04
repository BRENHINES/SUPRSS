import React from "react";
import SideHeader from "@/components/layout/SiteHeader";
import SideFooter from "@/components/layout/SiteFooter";

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({
  id,
  className = "",
  children,
}) => (
  <section id={id} className={`py-24 md:py-28 ${className}`}>
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

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 text-emerald-900 overflow-x-hidden">
      <SideHeader />

      <Section className="bg-gradient-to-b from-emerald-900/10 to-transparent rounded-[16px]">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-semibold">Politique de confidentialité</h1>
          <P>
            Cette politique explique quelles données nous collectons sur SUPRSS, pourquoi nous les collectons,
            et comment vous pouvez exercer vos droits.
          </P>
          <div className="mt-6 rounded-xl bg-white border p-4">
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              <li><a className="text-emerald-700 hover:underline" href="#collecte">Données collectées</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#usage">Finalités & bases légales</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#partage">Partage / sous-traitants</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#securite">Sécurité</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#conservation">Durées de conservation</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#droits">Vos droits</a></li>
              <li><a className="text-emerald-700 hover:underline" href="#contact">Contact DPO</a></li>
            </ul>
          </div>

          <H2 id="collecte">1. Données collectées</H2>
          <P>Compte : email, nom d’utilisateur, hash de mot de passe, métadonnées de session.</P>
          <P>Produit : flux/collections créés, préférences, tags, historique de lecture.</P>
          <P>Technique : logs (IP, user-agent) pour sécurité/diagnostic. Pas de cookies marketing.</P>

          <H2 id="usage">2. Finalités & bases légales</H2>
          <P>Exécution du service (contrat) : authentification, synchronisation, stockage de vos flux.</P>
          <P>Intérêt légitime : prévention fraude/abus, mesures d’audience minimales et anonymisées.</P>
          <P>Consentement : uniquement pour fonctionnalités optionnelles (ex. newsletters).</P>

          <H2 id="partage">3. Partage / sous-traitants</H2>
          <P>
            Nous ne vendons pas vos données. Des sous-traitants peuvent héberger l’infrastructure (hébergeur,
            mailer). Ils agissent conformément au RGPD et uniquement pour notre compte.
          </P>

          <H2 id="securite">4. Sécurité</H2>
          <P>Chiffrement en transit (HTTPS), mots de passe hashés, contrôle d’accès, journaux d’accès.</P>

          <H2 id="conservation">5. Durées de conservation</H2>
          <P>Compte tant qu’il est actif. Logs techniques : 90 jours. Sauvegardes : cycles limités.</P>

          <H2 id="droits">6. Vos droits</H2>
          <P>
            Accès, rectification, effacement, portabilité, opposition, limitation. Pour exercer : envoyez
            une demande depuis l’adresse associée à votre compte.
          </P>

          <H2 id="contact">7. Contact DPO</H2>
          <P>
            dpo@suprss.com — SUPRSS, 123 Rue de la Veille, 75000 Paris. Nous répondons sous 30 jours.
          </P>

          <p className="mt-8 text-sm text-emerald-900/70">Version : 1.0 — Dernière mise à jour : {new Date().toLocaleDateString()}</p>
        </div>
      </Section>

      <SideFooter />
    </div>
  );
};

export default Privacy;
