import React, { useEffect, useState } from 'react'
import AuthLayout from '@/components/ui/AuthLayout'
import Alert from '@/components/ui/Alert'
import { AuthAPI } from '@/auth/api'
import { useSearchParams, Link } from 'react-router-dom'


const VerifyEmailPage: React.FC = () => {
const [sp] = useSearchParams()
const token = sp.get('token') || ''
const [state, setState] = useState<'verifying' | 'success' | 'error'>('verifying')
const [error, setError] = useState<string | null>(null)


useEffect(() => {
AuthAPI.verify({ token })
.then(() => setState('success'))
.catch((e) => {
setState('error')
setError(e?.response?.data?.detail ?? 'Lien invalide ou expiré')
})
}, [token])


return (
<AuthLayout title="Vérification de l'email">
{state === 'verifying' && <Alert>Vérification en cours…</Alert>}
{state === 'success' && (
<div className="space-y-3">
<Alert kind="success">Votre email est vérifié. Vous pouvez vous connecter.</Alert>
<Link className="text-blue-600" to="/login">Aller à la connexion</Link>
</div>
)}
{state === 'error' && (
<div className="space-y-3">
<Alert kind="error">{error}</Alert>
<p className="text-sm text-neutral-600">Le lien a peut‑être expiré. Demandez un nouvel email de vérification.</p>
</div>
)}
</AuthLayout>
)
}
export default VerifyEmailPage