import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api"; // ton axios, déjà configuré

const OAuthCallback: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const at = params.get("access_token");
    const rt = params.get("refresh_token");
    const next = params.get("next") || "/";

    if (!at) {
      setErr("Aucun access_token reçu. Réessaie la connexion.");
      return;
    }

    // Stocke les tokens pour l’interceptor axios ET pour d’anciens contextes
    localStorage.setItem("access_token", at);
    if (rt) localStorage.setItem("refresh_token", rt);
    // (compat éventuelle si ton AuthContext lit ces clés)
    localStorage.setItem("suprss.access", at);
    if (rt) localStorage.setItem("suprss.refresh", rt);

    // Optionnel : vérifier l’auth côté API (réassure & hydrate le contexte au reload)
    api.get("/api/auth/me")
      .catch(() => {/* pas bloquant */})
      .finally(() => {
        // Forcer un “cycle” propre pour que l’AuthProvider relise les tokens
        navigate(next, { replace: true });
      });
  }, [params, navigate]);

  if (err) {
    return (
      <div className="p-8">
        <p className="text-red-600">{err}</p>
        <a className="text-blue-600 underline" href="/login">Retour à la connexion</a>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      Connexion en cours… (OAuth)
    </div>
  );
};

export default OAuthCallback;
