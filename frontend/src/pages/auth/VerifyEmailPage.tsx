import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { AuthAPI } from "@/auth/api";

const VerifyEmailPage: React.FC = () => {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [state, setState] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AuthAPI.verify({ token })
      .then(() => setState("success"))
      .catch((e) => {
        setState("error");
        setError(e?.response?.data?.detail ?? "Lien invalide ou expiré");
      });
  }, [token]);

  return (
    <AuthLayout
      title="Vérifie ton email"
      subtitle="Nous t’avons envoyé un lien de confirmation. Clique-le pour activer ton compte."
      imageUrl="https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1600&auto=format&fit=crop"
      quote="Onboarding clair, aucune friction. 10/10."
      author="Aïcha, Bruxelles"
    >
      {state === "verifying" && (
        <div className="rounded-md bg-neutral-100 p-4 border border-neutral-200 text-neutral-700">
          Vérification en cours…
        </div>
      )}

      {state === "success" && (
        <div className="space-y-3">
          <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 p-4">
            Ton email est vérifié. Tu peux te connecter.
          </div>
          <Link className="text-emerald-700 hover:underline" to="/login">Aller à la connexion</Link>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-3">
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 p-4">{error}</div>
          <p className="text-sm text-neutral-600">
            Le lien a peut-être expiré. Demande un nouvel email de vérification.
          </p>
        </div>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
