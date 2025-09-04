// src/components/settings/SettingsLayout.tsx
import React from "react";
import { NavLink } from "react-router-dom";

const LinkItem: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block rounded-xl px-3 py-2 transition ${
        isActive ? "bg-emerald-100 text-emerald-900" : "hover:bg-neutral-100"
      }`
    }
  >
    {label}
  </NavLink>
);

const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 text-emerald-950">
      <div className="px-4 md:px-6 lg:px-8 py-6 grid lg:grid-cols-[260px,1fr] gap-6">
        <aside className="rounded-2xl bg-white border border-neutral-200 p-4">
          <div className="font-semibold mb-2">Paramètres</div>
          <div className="grid gap-1">
            <LinkItem to="/settings/profile" label="Profil" />
            <LinkItem to="/settings/account" label="Compte" />
            <LinkItem to="/settings/security" label="Sécurité" />
            <LinkItem to="/settings/preferences" label="Préférences" />
            <LinkItem to="/settings/notifications" label="Notifications" />
            <LinkItem to="/settings/integrations" label="Intégrations" />
            <LinkItem to="/settings/billing" label="Facturation" />
            <LinkItem to="/settings/api" label="Clés API" />
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
};
export default SettingsLayout;
