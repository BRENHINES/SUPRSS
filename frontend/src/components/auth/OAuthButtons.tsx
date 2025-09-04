// src/components/auth/OAuthButtons.tsx
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { SiGithub } from "react-icons/si";

const apiBase =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta as any).env?.VITE_API_URL ||
  window.location.origin;

const base = String(apiBase).replace(/\/$/, "");

function startOAuth(provider: "google" | "github") {
  window.location.href = `${base}/api/auth/oauth/${provider}`;
}

export const OAuthButtons: React.FC<{ showGithub?: boolean }> = ({ showGithub = false }) => (
  <div className="grid gap-3">
    <button
      type="button"
      onClick={() => startOAuth("google")}
      className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-50  text-teal-700 hover:text-teal-900 hover:border-teal-900 transition"
    >
      <FcGoogle className="text-xl" />
      Se connecter avec Google
    </button>

    {showGithub && (
      <button
        type="button"
        onClick={() => startOAuth("github")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 text-teal-700 hover:text-teal-900 hover:border-teal-900 transition"
      >
        <SiGithub className="text-lg" />
        Se connecter avec GitHub
      </button>
    )}
  </div>
);
