import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { isOnboarded, markOnboarded } from "@/services/storage";
import { getMe, updateUser, type User } from "@/services/user";

type Step = 1 | 2 | 3;

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [step, setStep] = useState<Step>(1);

  // prefs rapides
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [font, setFont] = useState<"small" | "medium" | "large">("medium");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (isOnboarded(user.id)) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      const u = await getMe();
      setMe(u);
      setTheme((u.theme as any) || "light");
      setFont((u.font_size as any) || "medium");
    })();
  }, [user, navigate]);

  if (!user) return null; // protégé par ProtectedRoute

  const next = async () => {
  if (step === 2 && me) {
    setSaving(true); setErr(null); setMsg(null);
    try {
      await updateUser(me.id, { theme, font_size: font });
      setMsg("Préférences enregistrées.");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Échec de mise à jour.");
    } finally {
      setSaving(false);
    }
  }
  setStep(s => (s === 1 ? 2 : 3));   // <-- Step garanti
};

  const back = () => setStep(s => (s === 3 ? 2 : 1));

  const finish = () => {
    markOnboarded(user.id);
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <div className="text-sm text-neutral-500">Onboarding</div>
        <h1 className="text-2xl font-semibold">Bienvenue{me ? `, ${me.username}` : ""}</h1>
      </div>

      {/* steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3].map(n => (
          <div key={n} className={`h-1 flex-1 ${step>=n ? "bg-blue-600" : "bg-neutral-200"}`} />
        ))}
      </div>

      {/* step content */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-neutral-700">
            Merci de rejoindre <strong>SUPRSS</strong> ✨
          </p>
          <ul className="list-disc ml-6 text-neutral-700">
            <li>Suivez vos flux RSS facilement</li>
            <li>Importez vos abonnements OPML</li>
            <li>Personnalisez l’interface (thème, taille de police)</li>
          </ul>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Préférences d’affichage</h2>
          {msg && <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
          {err && <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">{err}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm">Thème</span>
              <select className="border rounded w-full px-3 py-2"
                      value={theme} onChange={(e)=>setTheme(e.target.value as any)}>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Auto</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm">Taille de police</span>
              <select className="border rounded w-full px-3 py-2"
                      value={font} onChange={(e)=>setFont(e.target.value as any)}>
                <option value="small">Petite</option>
                <option value="medium">Moyenne</option>
                <option value="large">Grande</option>
              </select>
            </label>
          </div>

          {saving && <div className="text-sm text-neutral-500">Enregistrement…</div>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Importer vos abonnements (optionnel)</h2>
          <p className="text-neutral-700">
            Vous pourrez importer un fichier OPML depuis la page <strong>Feeds</strong> plus tard.
          </p>
          <p className="text-neutral-700">
            Conseil : commencez avec quelques sources, vous affinerez au fur et à mesure.
          </p>
        </div>
      )}

      {/* footer buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button onClick={back} disabled={step===1}
                className="px-4 py-2 border rounded disabled:opacity-50">
          Précédent
        </button>
        {step < 3 ? (
          <button onClick={next} className="px-4 py-2 border rounded bg-blue-600 text-white">
            Continuer
          </button>
        ) : (
          <button onClick={finish} className="px-4 py-2 border rounded bg-green-600 text-white">
            Terminer
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
