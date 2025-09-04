import React, { useState } from "react";
import SideHeader from "@/components/layout/SiteHeader";
import SideFooter from "@/components/layout/SiteFooter";

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <section className={`py-24 md:py-28 ${className}`}>
    <div className="mx-auto w-full px-10 md:px-12 sm:px-12 lg:px-16 xl:px-24">{children}</div>
  </section>
);

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // branchement API ici si besoin
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-teal-900">
      <SideHeader />

      {/* Header + form */}
      <Section className="bg-teal-800 rounded-[16px]">
        <div className="grid md:grid-cols-[1fr,420px] gap-10 items-start">
          <div>
            <h1 className="text-6xl md:text-5xl font-semibold text-white">Contact</h1>
            <p className="mt-4 text-white">
              Une question, une idée, un partenariat ? Écris-nous — on répond vite.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-white">Support</h3>
                <p className="text-white text-sm mt-1">help@suprss.com</p>
              </div>
              <div>
                <h3 className="font-medium text-white">Feedback</h3>
                <p className="text-white text-sm mt-1">ideas@suprss.com</p>
              </div>
              <div>
                <h3 className="font-medium text-white">Presse</h3>
                <p className="text-white text-sm mt-1">media@suprss.com</p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-5 md:p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-teal-800">Écris-nous</h2>

            {sent ? (
              <p className="mt-4 text-emerald-200">
                Merci ! Ton message a été envoyé (démo). Nous reviendrons vers toi rapidement.
              </p>
            ) : (
              <>
                <div className="mt-4 grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Prénom"
                      className="rounded-lg bg-white border px-3 py-2 outline-none focus:border-emerald-600 focus:text-teal-900"
                    />
                    <input
                      required
                      placeholder="Nom"
                      className="rounded-lg bg-white border px-3 py-2 outline-none focus:border-emerald-600 focus:text-teal-900"
                    />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    className="rounded-lg bg-white border px-3 py-2 outline-none focus:border-emerald-600 focus:text-teal-900"
                  />
                  <input
                    placeholder="Téléphone (optionnel)"
                    className="rounded-lg bg-white border px-3 py-2 outline-none focus:border-emerald-600 focus:text-teal-900"
                  />
                  <textarea
                    required
                    rows={5}
                    placeholder="Comment pouvons-nous aider ?"
                    className="rounded-lg bg-white border px-3 py-2 outline-none focus:border-emerald-600 resize-y focus:text-teal-900"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-teal-800 text-white font-medium py-2.5 hover:bg-teal-900 transition"
                >
                  Envoyer
                </button>
              </>
            )}
          </form>
        </div>
      </Section>

      {/* Map + address */}
      <Section>
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden border border-emerald-900/30">
            <iframe
              title="SUPRSS HQ"
              className="w-full h-[340px]"
              loading="lazy"
              src="https://www.google.com/maps?q=Lyon&output=embed"
            />
          </div>
          <div>
            <h3 className="text-6xl md:text-5xl font-semibold text-teal-900">Nos bureaux</h3>
            <p className="mt-2 text-teal-800">
              SUPRSS — 123 Rue de la Veille, 75000 Paris, France
            </p>
            <div className="mt-6">
              <a
                href="mailto:hello@suprss.com"
                className="inline-flex rounded-xl bg-emerald-600 text-neutral-50 px-4 py-2 hover:bg-emerald-800 hover:text-neutral-50 transition"
              >
                hello@suprss.com
              </a>
            </div>
          </div>
        </div>
      </Section>

      <SideFooter />
    </div>
  );
};

export default Contact;
