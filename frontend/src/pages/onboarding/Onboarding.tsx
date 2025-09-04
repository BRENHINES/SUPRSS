// src/pages/Onboarding.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/common/OnboardingLayout";
import { markOnboarded } from "@/services/storage";
import { useAuth } from "@/auth/AuthContext";
import { FiCheck, FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";

type Step = 1 | 2 | 3;

const nextStep = (s: Step): Step => (s === 1 ? 2 : 3);
const prevStep = (s: Step): Step => (s === 3 ? 2 : 1);

// (UI) petites cartes toggle
const ToggleCard: React.FC<{
  active: boolean;
  onClick?: () => void;
  title: string;
  desc?: string;
}> = ({ active, onClick, title, desc }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-2xl border p-4 transition ${
      active
        ? "border-emerald-700 bg-emerald-50"
        : "border-neutral-200 bg-white hover:border-emerald-600"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 inline-grid place-items-center size-5 rounded-full border ${
          active ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300"
        }`}
      >
        {active && <FiCheck size={14} />}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        {desc && <div className="text-sm text-neutral-600 mt-0.5">{desc}</div>}
      </div>
    </div>
  </button>
);

const CATEGORIES = [
  { key: "tech", label: "Tech / Dev" },
  { key: "ai", label: "IA / Data" },
  { key: "product", label: "Produit / UX" },
  { key: "design", label: "Design" },
  { key: "startup", label: "Startups" },
  { key: "news", label: "Actus" },
];

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);

  // Step 2
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [feedUrl, setFeedUrl] = useState("");
  const canAddFeed = useMemo(() => /^https?:\/\//i.test(feedUrl.trim()), [feedUrl]);

  // Step 3 (préférences minimales pour la démo)
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [density, setDensity] = useState<"cozy" | "compact">("cozy");

  const toggleCat = (key: string) =>
    setSelectedCats((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));

  const addFeed = () => {
    // Branchement futur: POST /feeds (ou try discover)
    // Pour l’instant, on “réinitialise” juste l’input.
    setFeedUrl("");
  };

  const goNext = () => setStep((s) => nextStep(s));
  const goPrev = () => setStep((s) => prevStep(s));

  const finish = () => {
    // Ici tu pourras: enregistrer prefs côté backend si tu le souhaites
    markOnboarded(user?.id);
    navigate("/", { replace: true });
  };

  return (
    <OnboardingLayout
      title={
        step === 1
          ? `Bienvenue${user?.username ? `, ${user.username}` : ""} !`
          : step === 2
          ? "Choisis tes sources et intérêts"
          : "Préférences de lecture"
      }
      subtitle={
        step === 1
          ? "3 étapes rapides pour personnaliser SUPRSS."
          : step === 2
          ? "Ajoute quelques thèmes et, si tu veux, une première source RSS."
          : "Paramètre ton thème et la densité d’affichage."
      }
    >
      {/* Étape 1 */}
      {step === 1 && (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
            <div className="font-medium text-emerald-900">Ce que tu vas gagner</div>
            <ul className="list-disc pl-5 text-neutral-700 mt-2 space-y-1">
              <li>Un lecteur rapide, clair et sans noise</li>
              <li>Des articles priorisés selon tes centres d’intérêt</li>
              <li>Des collections pour organiser et partager</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 transition"
            >
              Continuer <FiChevronRight />
            </button>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 font-medium hover:border-emerald-700 transition"
            >
              Passer pour l’instant
            </button>
          </div>
        </div>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <div className="grid gap-6">
          <div>
            <div className="text-sm text-neutral-600 mb-2">Centres d’intérêt</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <ToggleCard
                  key={c.key}
                  active={selectedCats.includes(c.key)}
                  onClick={() => toggleCat(c.key)}
                  title={c.label}
                  desc=""
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-neutral-600 mb-2">Ajouter un flux (optionnel)</div>
            <div className="flex gap-2">
              <input
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://exemple.com/rss"
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
              />
              <button
                type="button"
                onClick={addFeed}
                disabled={!canAddFeed}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2 font-medium hover:bg-emerald-900 disabled:opacity-50 transition"
              >
                <FiPlus /> Ajouter
              </button>
            </div>
            {!canAddFeed && feedUrl.length > 0 && (
              <div className="text-xs text-neutral-500 mt-1">Entre une URL commençant par http(s)://</div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={goPrev}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 font-medium hover:border-emerald-700 transition"
            >
              <FiChevronLeft /> Retour
            </button>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 transition"
            >
              Continuer <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <div className="grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-600 mb-2">Thème</div>
              <div className="grid grid-cols-3 gap-2">
                {(["auto", "light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`rounded-xl border px-3 py-2 font-medium capitalize ${
                      theme === t ? "border-emerald-700 bg-emerald-50" : "border-neutral-200 bg-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600 mb-2">Densité</div>
              <div className="grid grid-cols-2 gap-2">
                {(["cozy", "compact"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDensity(d)}
                    className={`rounded-xl border px-3 py-2 font-medium capitalize ${
                      density === d ? "border-emerald-700 bg-emerald-50" : "border-neutral-200 bg-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
            <div className="font-medium text-emerald-900">C’est bon !</div>
            <p className="text-neutral-700 mt-1">
              Tu pourras modifier ces préférences à tout moment dans <b>Paramètres</b>.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={goPrev}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 font-medium hover:border-emerald-700 transition"
            >
              <FiChevronLeft /> Retour
            </button>
            <button
              onClick={finish}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 transition"
            >
              Terminer
            </button>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default Onboarding;
