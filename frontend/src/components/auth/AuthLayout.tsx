import React from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  imageUrl?: string;
  quote?: string;
  author?: string;
  rightBrand?: React.ReactNode; // ex: logo SUPRSS
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  imageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop",
  quote = "Rester informé n'a jamais été aussi simple. SUPRSS me fait gagner des heures chaque semaine.",
  author = "Utilisateur SUPRSS",
  rightBrand = <span className="font-semibold">SUPRSS</span>,
}) => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-neutral-50 overflow-hidden">
      {/* Colonne formulaire */}
      <div className="flex items-center justify-center px-6 sm:px-10 md:px-12 lg:px-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-semibold text-emerald-950">{title}</h1>
          {subtitle && <p className="mt-2 text-neutral-600">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          <p className="mt-10 text-xs text-neutral-500">
            Protégé par chiffrement et respect de la vie privée. <Link className="underline" to="/privacy">En savoir plus</Link>
          </p>
        </div>
      </div>

      {/* Colonne visuel / témoignage */}
      <div className="relative hidden md:block">
        <img
          src={imageUrl}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

        {/* Branding en haut à droite */}
        <div className="absolute top-4 right-5 rounded-full bg-black/30 backdrop-blur px-3 py-1.5 text-white text-sm">
          {rightBrand}
        </div>

        {/* Témoignage en bas */}
        <div className="absolute bottom-6 right-6 left-6 md:left-auto md:w-[min(560px,calc(100%-3rem))]">
          <div className="rounded-2xl bg-white/20 backdrop-blur-md text-white p-5 md:p-6 border border-white/25">
            <p className="text-xl font-semibold leading-relaxed">
              {quote}
            </p>
            <p className="mt-3 text-sm text-white/80">{author}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
