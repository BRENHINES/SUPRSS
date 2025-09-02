import React from "react";
import { Link, NavLink } from "react-router-dom";

const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm ${isActive ? "text-blue-600 font-medium" : "text-neutral-600 hover:text-neutral-900"}`
    }
  >
    {children}
  </NavLink>
);

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black" />
            <span className="font-semibold">SUPRSS</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <NavItem to="/features">Fonctionnalités</NavItem>
            <NavItem to="/about">À propos</NavItem>
            <NavItem to="/help">Aide</NavItem>
            <NavItem to="/contact">Contact</NavItem>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-2 text-sm">Connexion</Link>
            <Link to="/register" className="px-3 py-2 text-sm rounded-lg bg-black text-white">Créer un compte</Link>
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-6 text-sm text-neutral-600">
          <div>
            <div className="font-semibold text-neutral-900 mb-2">SUPRSS</div>
            <p className="leading-relaxed">Lecteur RSS moderne. Minimal, rapide, centré.</p>
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-2">Produit</div>
            <ul className="space-y-1">
              <li><Link to="/features" className="hover:text-neutral-900">Fonctionnalités</Link></li>
              <li><Link to="/help" className="hover:text-neutral-900">Aide</Link></li>
              <li><Link to="/privacy" className="hover:text-neutral-900">Confidentialité</Link></li>
              <li><Link to="/terms" className="hover:text-neutral-900">Conditions</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-2">Compte</div>
            <ul className="space-y-1">
              <li><Link to="/login" className="hover:text-neutral-900">Connexion</Link></li>
              <li><Link to="/register" className="hover:text-neutral-900">Créer un compte</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
