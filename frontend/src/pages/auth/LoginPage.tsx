import React, { useEffect, useState } from 'react';
import AuthLayout from '@/components/ui/AuthLayout';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { loginSchema } from '@/auth/validators';
import { useAuth } from '@/auth/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;

  // Déjà loggé ? on renvoie vers /
  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: emailOrUsername, password });
    if (!parsed.success) return setError('Veuillez vérifier vos informations.');
    try {
      setBusy(true);
      setError(null);
      await login(emailOrUsername, password);

      // destination "safe"
      const from = location.state?.from?.pathname;
      const to = from && from !== '/login' ? from : '/';
      navigate(to, { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Identifiants invalides');
    } finally {
      setBusy(false);
    }
  };

  const oauth = (provider: "google" | "github") => {
  const base = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
  window.location.href = `${base}/api/auth/oauth/${provider}`;
};

  return (
    <AuthLayout title="Connexion" subtitle="Minimal, rapide, centré — style Medium">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}
        <TextField
          label="Email ou nom d'utilisateur"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          autoFocus
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button loading={busy} type="submit">Se connecter</Button>
      </form>

      <div className="mt-4 text-sm flex justify-between">
        <Link className="text-blue-600" to="/register">Créer un compte</Link>
        <Link className="text-blue-600" to="/forgot-password">Mot de passe oublié</Link>
      </div>

      <div className="mt-6 space-y-2">
        <button onClick={() => oauth('google')} className="w-full border py-2 rounded-lg">Continuer avec Google</button>
        <button onClick={() => oauth('github')} className="w-full border py-2 rounded-lg">Continuer avec GitHub</button>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
