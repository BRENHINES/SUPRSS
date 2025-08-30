import React, { useMemo, useState } from 'react'
import AuthLayout from '@/components/ui/AuthLayout'
import TextField from '@/components/ui/TextField'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { resetSchema } from '@/auth/validators'
import { AuthAPI } from '@/auth/api'
import { useSearchParams } from 'react-router-dom'


const strength = (pwd: string) => {
let score = 0
if (pwd.length >= 8) score++
if (/[A-Z]/.test(pwd)) score++
if (/[a-z]/.test(pwd)) score++
if (/[0-9]/.test(pwd)) score++
if (/[^A-Za-z0-9]/.test(pwd)) score++
return score // 0..5
}


const ResetPasswordPage: React.FC = () => {
const [sp] = useSearchParams()
const token = sp.get('token') || ''
const [password, setPassword] = useState('')
const [confirm, setConfirm] = useState('')
const [status, setStatus] = useState<'ready' | 'success' | 'error'>('ready')
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)


const score = useMemo(() => strength(password), [password])


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault()
const parsed = resetSchema.safeParse({ password })
if (!parsed.success) return setError('Mot de passe trop faible')
if (password !== confirm) return setError('Les mots de passe ne correspondent pas')
try {
setLoading(true)
setError(null)
await AuthAPI.reset({ token, password })
setStatus('success')
} catch (e: any) {
setStatus('error')
setError(e?.response?.data?.detail ?? 'Lien invalide ou expiré')
} finally {
setLoading(false)
}
}


return (
<AuthLayout title="Réinitialiser le mot de passe">
{status === 'success' ? (
<Alert kind="success">Mot de passe mis à jour. Vous pouvez vous connecter.</Alert>
) : (
<form onSubmit={onSubmit} className="space-y-4">
{error && <Alert kind="error">{error}</Alert>}
<TextField label="Nouveau mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
<div className="h-1 w-full bg-neutral-200 rounded">
<div className={`h-1 rounded ${['w-1/6','w-2/6','w-3/6','w-4/6','w-5/6','w-full'][score]} ${score < 3 ? 'bg-red-500' : score < 4 ? 'bg-yellow-500' : 'bg-green-600'}`}></div>
</div>
<TextField label="Confirmer" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
<Button loading={loading} type="submit">Enregistrer</Button>
</form>
)}
</AuthLayout>
)
}
export default ResetPasswordPage