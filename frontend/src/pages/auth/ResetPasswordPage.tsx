import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { resetSchema } from "@/auth/validators";
import { AuthAPI } from "@/auth/api";

const strength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0..5
};

const ResetPasswordPage: React.FC = () => {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"ready" | "success" | "error">("ready");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => strength(password), [password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetSchema.safeParse({ password });
    if (!parsed.success) return setError("Mot de passe trop faible");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas");

    try {
      setLoading(true);
      setError(null);
      await AuthAPI.reset({ token, password });
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setError(e?.response?.data?.detail ?? "Lien invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Définir un nouveau mot de passe"
      subtitle={token ? "Choisis un nouveau mot de passe sécurisé." : "Lien invalide ou expiré."}
      imageUrl="https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1600&auto=format&fit=crop"
      quote="La sécurité sans friction : simple et rassurant."
      author="Yanis, Nantes"
    >
      {!token ? (
        <p className="text-neutral-600">
          Le lien semble invalide. Demande un nouveau lien depuis{" "}
          <Link to="/forgot-password" className="text-emerald-700 hover:underline">Mot de passe oublié</Link>.
        </p>
      ) : status === "success" ? (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 p-4">
          Ton mot de passe a été mis à jour. Tu peux maintenant{" "}
          <Link className="underline" to="/login">te connecter</Link>.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4">
          {error && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

          <div className="grid gap-1">
            <label className="text-sm text-neutral-700">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          {/* Barre de force */}
          <div className="h-1 w-full bg-neutral-200 rounded">
            <div
              className={`h-1 rounded ${
                ["w-1/6","w-2/6","w-3/6","w-4/6","w-5/6","w-full"][score]
              } ${score < 3 ? "bg-red-500" : score < 4 ? "bg-yellow-500" : "bg-green-600"}`}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-neutral-700">Confirmation</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-md bg-emerald-800 text-white py-2.5 font-medium hover:bg-emerald-900 disabled:opacity-60 transition"
          >
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
