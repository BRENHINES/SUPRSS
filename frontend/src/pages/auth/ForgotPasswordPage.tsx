import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { forgotSchema } from "@/auth/validators";
import { AuthAPI } from "@/auth/api";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) return setError("Email invalide");

    try {
      setLoading(true);
      setError(null);
      await AuthAPI.forgot({ email });
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Erreur lors de l’envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Réinitialiser le mot de passe"
      subtitle="Entre l’adresse de ton compte. On t’enverra un lien de réinitialisation."
      imageUrl="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop"
      quote="Support réactif et clair : j’ai récupéré mon compte en 2 minutes."
      author="Nora, Bordeaux"
    >
      {sent ? (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 p-4">
          Si un compte existe pour <b>{email}</b>, un email vient d’être envoyé avec les instructions.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4">
          {error && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
          <div className="grid gap-1">
            <label className="text-sm text-neutral-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-md bg-teal-700 text-white py-2.5 font-medium hover:bg-teal-900 disabled:opacity-60 transition"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
          <p className="text-sm text-neutral-600">
            <Link className="text-emerald-700 hover:underline hover:text-teal-900" to="/login">Retour à la connexion</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
