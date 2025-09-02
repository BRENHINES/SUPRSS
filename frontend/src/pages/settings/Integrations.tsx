import React, { useEffect, useState } from "react";
import { getMe, type User } from "@/services/user";

const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://suprss.onrender.com";

const Integrations: React.FC = () => {
  const [me, setMe] = useState<User | null>(null);
  useEffect(()=>{ (async()=> setMe(await getMe()))(); }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Intégrations</h1>

      {!me ? (
        <div className="mt-4">Chargement…</div>
      ) : (
        <div className="mt-4 space-y-6">
          <section className="border rounded p-4">
            <h2 className="font-medium">Google</h2>
            <p className="text-sm text-neutral-600">Connexion via Google OAuth</p>
            <div className="mt-2">
              {me.google_id ? (
                <span className="text-green-700 text-sm">Déjà lié.</span>
              ) : (
                <a className="px-3 py-1 border rounded inline-block"
                   href={`${base}/api/auth/oauth/google`} rel="noreferrer">
                  Lier mon compte Google
                </a>
              )}
            </div>
          </section>

          <section className="border rounded p-4">
            <h2 className="font-medium">GitHub</h2>
            <p className="text-sm text-neutral-600">Connexion via GitHub OAuth</p>
            <div className="mt-2">
              {me.github_id ? (
                <span className="text-green-700 text-sm">Déjà lié.</span>
              ) : (
                <a className="px-3 py-1 border rounded inline-block"
                   href={`${base}/api/auth/oauth/github`} rel="noreferrer">
                  Lier mon compte GitHub
                </a>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
export default Integrations;
