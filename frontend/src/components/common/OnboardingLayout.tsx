// src/components/onboarding/OnboardingLayout.tsx
import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  side?: React.ReactNode; // visuel / illustration optionnelle
};

const OnboardingLayout: React.FC<Props> = ({ title, subtitle, children, side }) => {
  return (
    <div className="min-h-screen bg-neutral-50 text-emerald-950">
      <div className="mx-auto w-full px-10 md:px-12 lg:px-16 xl:px-24 py-10">
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          <div className="rounded-3xl bg-white border border-neutral-200 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-2 text-neutral-600">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-700 p-8 text-white relative overflow-hidden">
            {/* anneaux décoratifs */}
            <div className="absolute -top-16 -right-20 size-[260px] rounded-full border border-white/10" />
            <div className="absolute -bottom-10 -left-14 size-[220px] rounded-full border border-white/10" />
            <div className="relative">
              {side ?? (
                <div className="space-y-4">
                  <div className="text-2xl font-medium">Bienvenue sur SUPRSS</div>
                  <p className="text-emerald-100/90">
                    Centralise tes flux, priorise ce qui compte, et collabore sans friction.
                  </p>
                  <ul className="text-emerald-100/80 list-disc pl-5 space-y-1">
                    <li>Ajoute tes flux favoris</li>
                    <li>Choisis tes centres d’intérêt</li>
                    <li>Personnalise l’expérience de lecture</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
