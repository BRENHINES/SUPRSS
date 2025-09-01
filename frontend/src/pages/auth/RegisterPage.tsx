// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { registerSchema } from "@/auth/validators";
import { useAuth } from "@/auth/AuthContext"; // nom du fichier/context à respecter
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/ui/AuthLayout";
import Alert from "@/components/ui/Alert";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

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
      // Essaye d’extraire les erreurs renvoyées par FastAPI
      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        // format Pydantic/validation errors: [{loc: [..., 'email'], msg: '...'}, ...]
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
    <AuthLayout title="Créer un compte">
      <form onSubmit={onSubmit} className="space-y-4">
        {serverError && <Alert kind="error">{serverError}</Alert>}

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={onChange("email")}
          error={fieldErrors.email}
        />
        <TextField
          label="Nom d'utilisateur"
          value={form.username}
          onChange={onChange("username")}
          error={fieldErrors.username}
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={form.password}
          onChange={onChange("password")}
          error={fieldErrors.password}
        />
        <TextField
          label="Confirmer le mot de passe"
          type="password"
          value={form.confirm}
          onChange={onChange("confirm")}
          error={fieldErrors.confirm}
        />

        <Button loading={loading} disabled={loading} type="submit">
          S'inscrire
        </Button>
      </form>

      <div className="mt-4 text-sm">
        <Link className="text-blue-600" to="/login">
          Déjà un compte ? Se connecter
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
