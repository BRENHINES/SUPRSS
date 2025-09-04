import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useAuth } from "@/auth/AuthContext";
import { loginSchema } from "@/auth/validators";

const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;

  // Déjà loggé ? on renvoie vers /
  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: emailOrUsername, password });
    if (!parsed.success) return setErr("Veuillez vérifier vos informations.");

    try {
      setBusy(true);
      setErr(null);
      await login(emailOrUsername, password);

      // destination "safe"
      const from = location.state?.from?.pathname;
      const to = from && from !== "/login" ? from : "/";
      navigate(to, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Identifiants invalides");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Content de te revoir !"
      subtitle="Entre tes identifiants pour accéder à ton compte SUPRSS."
      imageUrl="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop"
      quote="Grâce à SUPRSS, je ne rate plus aucune actu. Tout est centralisé et priorisé."
      author="Camille, Paris"
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        {err && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}

        <div className="grid gap-1">
          <label className="text-sm text-neutral-700">Email ou nom d’utilisateur</label>
          <input
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            placeholder="moi@exemple.com"
            className="rounded-md border border-neutral-300 text-teal-900 px-3 py-2 outline-none focus:border-emerald-600 focus:text-teal-900 bg-white"
          />
        </div>

        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-neutral-700">Mot de passe</label>
            <Link to="/forgot-password" className="text-sm text-teal-700 hover:underline hover:text-teal-900">
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
            className="rounded-md border text-teal-900 border-neutral-300 px-3 py-2 outline-none focus:text-teal-900 hover:text-teal-900 bg-white"
          />
        </div>

        <button
          disabled={busy}
          className="w-full rounded-md bg-teal-700 text-white py-2.5 font-medium hover:bg-teal-900 disabled:opacity-60 transition"
        >
          {busy ? "Connexion..." : "Se connecter"}
        </button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-neutral-50 px-2 text-xs text-neutral-500">ou</span>
          </div>
        </div>

        <OAuthButtons showGithub />

        <p className="text-sm text-neutral-600 mt-3">
          Pas de compte ?{" "}
          <Link className="text-teal-700 hover:underline hover:text-teal-900" to="/register">
            Inscription
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
