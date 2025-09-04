// src/components/app/AppShell.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FiHome, FiFolder, FiBookmark, FiStar, FiClock, FiSearch, FiBell, FiCompass, FiUser, FiSettings } from "react-icons/fi";

const Item: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
        isActive ? "bg-emerald-100 text-emerald-900" : "hover:bg-neutral-100"
      }`
    }
  >
    <span className="text-emerald-700">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px,1fr] bg-neutral-50 text-emerald-950">
      <aside className="hidden lg:block border-r border-neutral-200 bg-white">
        <div className="p-5">
          <Link to="/" className="block text-emerald-900 font-semibold text-xl">SUPRSS</Link>
          <div className="mt-6 grid gap-1">
            <Item to="/app" icon={<FiHome />} label="Accueil" />
            <Item to="/feeds" icon={<FiFolder />} label="Flux" />
            <Item to="/collections" icon={<FiFolder />} label="Collections" />
            <Item to="/saved" icon={<FiBookmark />} label="Enregistrés" />
            <Item to="/starred" icon={<FiStar />} label="Étoilés" />
            <Item to="/history" icon={<FiClock />} label="Historique" />
            <Item to="/search" icon={<FiSearch />} label="Recherche" />
            <Item to="/notifications" icon={<FiBell />} label="Notifications" />
            <Item to="/explore" icon={<FiCompass />} label="Explorer" />
            <Item to="/me" icon={<FiUser />} label="Profil" />
            <Item to="/settings/index" icon={<FiSettings />} label="Paramètres" />
          </div>
        </div>
      </aside>

      <main>
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
          <div className="px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="font-medium">SUPRSS App</div>
            <div className="text-sm text-neutral-600">Version 0.1.0</div>
          </div>
        </header>
        <div className="px-4 md:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
