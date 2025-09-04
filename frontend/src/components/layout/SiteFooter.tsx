import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="bg-teal-900 text-white">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white font-bold">S</div>
              <span className="text-lg font-semibold">SUPRSS</span>
            </div>
            <p className="mt-4 text-neutral-50">
              Lecteur RSS moderne : plus rapide, plus simple, plus intelligent.
              Restez à jour sans bruit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-100">Produit</h4>
            <ul className="mt-4 space-y-2 text-white">
              <li><Link to="/features" className="hover:text-neutral-200">Fonctionnalités</Link></li>
              <li><Link to="/help" className="hover:text-neutral-200">Centre d’aide</Link></li>
              <li><Link to="/privacy" className="hover:text-neutral-200">Confidentialité</Link></li>
              <li><Link to="/terms" className="hover:text-neutral-200">Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-100">Ressources</h4>
            <ul className="mt-4 space-y-2 text-white">
              <li><Link to="/about" className="hover:text-neutral-200">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-neutral-200">Contact</Link></li>
              <li><a href="#" className="hover:text-neutral-200">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-100">Nous écrire</h4>
            <p className="mt-4 text-neutral-50">hello@suprss.com</p>
            <div className="mt-4 flex gap-3">
              <a aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-md bg-teal-100">in</a>
              <a aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-md bg-teal-100">gh</a>
              <a aria-label="X" className="grid h-9 w-9 place-items-center rounded-md bg-teal-100">x</a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-50 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-500">
          <p className="text-neutral-50">© {new Date().getFullYear()} SUPRSS. Tous droits réservés.</p>
          <div className="space-x-4">
            <Link to="/terms" className="hover:text-neutral-300">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-neutral-300">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
