import React from "react";
import SettingsLayout from "@/components/layout/SettingsLayout";
import { Link } from "react-router-dom";
import { FiUser, FiShield, FiSliders, FiBell, FiZap, FiDatabase, FiCreditCard, FiKey } from "react-icons/fi";

const Card: React.FC<{ to: string; icon: React.ReactNode; title: string; desc: string }> = ({ to, icon, title, desc }) => (
  <Link to={to} className="rounded-2xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50 transition">
    <div className="flex items-start gap-3">
      <div className="grid place-items-center size-10 rounded-xl bg-emerald-50 text-emerald-700">{icon}</div>
      <div>
        <div className="font-medium text-teal-900">{title}</div>
        <div className="text-sm text-neutral-600 mt-1">{desc}</div>
      </div>
    </div>
  </Link>
);

const SettingsIndex: React.FC = () => (
  <SettingsLayout>
    <div className="rounded-2xl bg-white border border-neutral-200 p-5 md:p-6">
      <h1 className="text-2xl font-semibold text-teal-900">Paramètres</h1>
      <p className="text-neutral-600 mt-1">Gérez votre profil, sécurité, préférences et intégrations.</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card to="/settings/profile" icon={<FiUser />} title="Profil" desc="Nom, avatar, bio." />
        <Card to="/settings/account" icon={<FiDatabase />} title="Compte" desc="Email, identifiants, suppression." />
        <Card to="/settings/security" icon={<FiShield />} title="Sécurité" desc="Mots de passe, 2FA (bientôt)." />
        <Card to="/settings/preferences" icon={<FiSliders />} title="Préférences" desc="Thème, lecture, raccourcis." />
        <Card to="/settings/notifications" icon={<FiBell />} title="Notifications" desc="Emails, desktop, résumés." />
        <Card to="/settings/integrations" icon={<FiZap />} title="Intégrations" desc="Slack, Notion, Pocket…" />
        <Card to="/settings/billing" icon={<FiCreditCard />} title="Facturation" desc="Abonnement (si besoin plus tard)." />
        <Card to="/settings/api" icon={<FiKey />} title="Clés API" desc="Tokens développeur." />
      </div>
    </div>
  </SettingsLayout>
);

export default SettingsIndex;
