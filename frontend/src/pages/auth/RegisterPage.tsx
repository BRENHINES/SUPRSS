import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useAuth } from "@/auth/AuthContext";
import { registerSchema } from "@/auth/validators";

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1) validation client
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errs = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setFieldErrors({});
    setServerError(null);

    try {
      // 2) appel API via le AuthContext
      await register(form.email, form.username, form.password);

      // 3) redirection
      const to = location?.state?.from?.pathname ?? "/";
      navigate(to, { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const errs: Record<string, string> = {};
        for (const d of detail) {
          const path = Array.isArray(d.loc) ? d.loc.at(-1) : d.loc;
          if (typeof path === "string") errs[path] = d.msg || "Invalide";
        }
        setFieldErrors(errs);
      } else if (typeof detail === "string") {
        setServerError(detail);
      } else {
        setServerError("Inscription impossible. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Gratuit, sans carte. Reprends le contrôle de ta veille."
      imageUrl="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop"
      quote="Une veille propre, partageable et actionnable — exactement ce qu’il me fallait."
      author="Louis, Lyon"
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        {serverError && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{serverError}</div>}

        <div className="grid gap-1">
          <label className="text-sm text-neutral-700">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={onChange("email")}
            required
            className={`rounded-md text-teal-900 focus:text-teal-900 border ${fieldErrors.email ? "border-red-400" : "border-neutral-300"} px-3 py-2 outline-none focus:border-emerald-600 bg-white`}
          />
          {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-neutral-700">Nom d’utilisateur</label>
          <input
            value={form.username}
            onChange={onChange("username")}
            required
            className={`rounded-md text-teal-900 focus:text-teal-900 border ${fieldErrors.username ? "border-red-400" : "border-neutral-300"} px-3 py-2 outline-none focus:border-emerald-600 bg-white`}
          />
          {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-neutral-700">Mot de passe</label>
          <input
            type="password"
            value={form.password}
            onChange={onChange("password")}
            required
            className={`rounded-md text-teal-900 focus:text-teal-900 border ${fieldErrors.password ? "border-red-400" : "border-neutral-300"} px-3 py-2 outline-none focus:border-emerald-600 bg-white`}
          />
          {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-neutral-700">Confirmer le mot de passe</label>
          <input
            type="password"
            value={form.confirm}
            onChange={onChange("confirm")}
            required
            className={`rounded-md text-teal-900 focus:text-teal-900 border ${fieldErrors.confirm ? "border-red-400" : "border-neutral-300"} px-3 py-2 outline-none focus:border-emerald-600 bg-white`}
          />
          {fieldErrors.confirm && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirm}</p>}
        </div>

        <button
          disabled={loading}
          className="w-full rounded-md bg-teal-700 text-white py-2.5 font-medium hover:bg-teal-900 disabled:opacity-60 transition"
        >
          {loading ? "Création..." : "Créer mon compte"}
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
          Déjà inscrit ? <Link className="text-emerald-700 hover:underline" to="/login">Connexion</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
