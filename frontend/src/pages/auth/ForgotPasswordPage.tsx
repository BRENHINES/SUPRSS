import React, { useState } from 'react'
import AuthLayout from '@/components/ui/AuthLayout'
import TextField from '@/components/ui/TextField'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { forgotSchema } from '@/auth/validators'
import { AuthAPI } from '@/auth/api'


const ForgotPasswordPage: React.FC = () => {
const [email, setEmail] = useState('')
const [sent, setSent] = useState(false)
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault()
const parsed = forgotSchema.safeParse({ email })
if (!parsed.success) return setError('Email invalide')
try {
setLoading(true)
setError(null)
await AuthAPI.forgot({ email })
setSent(true)
} catch (e: any) {
setError(e?.response?.data?.detail ?? 'Erreur lors de l’envoi')
} finally {
setLoading(false)
}
}


return (
<AuthLayout title="Mot de passe oublié" subtitle={"Nous vous enverrons un lien de réinitialisation si l'email existe"}>
<form onSubmit={onSubmit} className="space-y-4">
{sent && <Alert kind="success">Vérifiez votre boîte mail.</Alert>}
{error && <Alert kind="error">{error}</Alert>}
<TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
<Button loading={loading} type="submit">Envoyer le lien</Button>
</form>
</AuthLayout>
)
}
export default ForgotPasswordPage