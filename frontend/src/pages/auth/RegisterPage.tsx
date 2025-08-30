import React, { useState } from 'react'
import { registerSchema } from '@/auth/validators'
import { useAuth } from '@/auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from "@/components/ui/AuthLayout";
import Alert from "@/components/ui/Alert";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";


const RegisterPage: React.FC = () => {
const { register } = useAuth()
const [email, setEmail] = useState('')
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
const [confirm, setConfirm] = useState('')
const [errors, setErrors] = useState<Record<string, string> | null>(null)
const [serverError, setServerError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)
const navigate = useNavigate()


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault()
const parsed = registerSchema.safeParse({ email, username, password, confirm })
if (!parsed.success) {
const errs = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.'), i.message]))
setErrors(errs)
return
}
try {
setLoading(true)
setErrors(null)
setServerError(null)
await register(email, username, password)
navigate('/')
} catch (e: any) {
setServerError(e?.response?.data?.detail ?? 'Inscription impossible')
} finally {
setLoading(false)
}
}


return (
<AuthLayout title="Créer un compte">
<form onSubmit={onSubmit} className="space-y-4">
{serverError && <Alert kind="error">{serverError}</Alert>}
<TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors?.email} />
<TextField label="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} error={errors?.username} />
<TextField label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors?.password} />
<TextField label="Confirmer le mot de passe" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors?.confirm} />
<Button loading={loading} type="submit">S'inscrire</Button>
</form>
<div className="mt-4 text-sm">
<Link className="text-blue-600" to="/login">Déjà un compte ? Se connecter</Link>
</div>
</AuthLayout>
)
}
export default RegisterPage