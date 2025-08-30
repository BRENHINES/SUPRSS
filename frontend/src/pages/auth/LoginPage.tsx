import React, { useState } from 'react'
import AuthLayout from '@/components/ui/AuthLayout'
import TextField from '@/components/ui/TextField'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { loginSchema } from '@/auth/validators'
import { useAuth } from '@/auth/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'


const LoginPage: React.FC = () => {
const { login } = useAuth()
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)
const navigate = useNavigate()
const location = useLocation() as any


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault()
const parsed = loginSchema.safeParse({ email, password })
if (!parsed.success) return setError('Veuillez vérifier vos informations.')
try {
setLoading(true)
setError(null)
await login(email, password)
const to = location.state?.from?.pathname || '/'
navigate(to, { replace: true })
} catch (e: any) {
setError(e?.response?.data?.detail ?? 'Identifiants invalides')
} finally {
setLoading(false)
}
}


const oauth = (provider: string) => {
window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/oauth/${provider}`
}


return (
<AuthLayout title="Connexion" subtitle="Minimal, rapide, centré — style Medium">
<form onSubmit={onSubmit} className="space-y-4">
{error && <Alert kind="error">{error}</Alert>}
<TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
<TextField label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
<Button loading={loading} type="submit">Se connecter</Button>
</form>
<div className="mt-4 text-sm flex justify-between">
<Link className="text-blue-600" to="/register">Créer un compte</Link>
<Link className="text-blue-600" to="/forgot-password">Mot de passe oublié</Link>
</div>
<div className="mt-6 space-y-2">
<button onClick={() => oauth('google')} className="w-full border py-2 rounded-lg">Continuer avec Google</button>
<button onClick={() => oauth('github')} className="w-full border py-2 rounded-lg">Continuer avec GitHub</button>
<button onClick={() => oauth('microsoft')} className="w-full border py-2 rounded-lg">Continuer avec Microsoft</button>
</div>
</AuthLayout>
)
}
export default LoginPage