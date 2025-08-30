import React, { useEffect, useState } from 'react'
import AuthLayout from '@/components/ui/AuthLayout'
import Alert from '@/components/ui/Alert'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AuthAPI, setAccessToken } from '@/auth/api'


const OAuthCallbackPage: React.FC = () => {
const { provider } = useParams()
const [sp] = useSearchParams()
const navigate = useNavigate()
const [state, setState] = useState<'exchanging' | 'success' | 'error'>('exchanging')
const [error, setError] = useState<string | null>(null)


useEffect(() => {
const code = sp.get('code') || ''
const stateParam = sp.get('state') || undefined
AuthAPI.oauthCallback(provider || 'google', { code, state: stateParam })
.then((data) => {
setAccessToken(data.access_token)
localStorage.setItem('suprss.access', data.access_token)
setState('success')
navigate('/', { replace: true })
})
.catch((e) => {
setError(e?.response?.data?.detail ?? "Échec de l'authentification")
setState('error')
})
}, [provider])


return (
<AuthLayout title="Connexion en cours…">
{state === 'exchanging' && <Alert>Échange du code avec {provider}…</Alert>}
{state === 'error' && <Alert kind="error">{error}</Alert>}
</AuthLayout>
)
}
export default OAuthCallbackPage