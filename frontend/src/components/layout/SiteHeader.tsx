import { Link, NavLink } from "react-router-dom";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors hover:text-emerald-700 ${isActive ? "text-emerald-700" : "text-neutral-700"}`;

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white">S</span>
          <span>SUPRSS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={linkCls} end>Accueil</NavLink>
          <NavLink to="/features" className={linkCls}>Fonctionnalités</NavLink>
          <NavLink to="/about" className={linkCls}>À propos</NavLink>
          <NavLink to="/help" className={linkCls}>Aide</NavLink>
          <NavLink to="/contact" className={linkCls}>Contact</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-neutral-700 hover:text-emerald-700">Se connecter</Link>
          <Link
            to="/register"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 hover:text-neutral-50"
          >
            S’inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
