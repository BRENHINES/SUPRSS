import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage'


const Home: React.FC = () => (
<div className="min-h-screen grid place-items-center p-10">
<div className="text-center">
<h1 className="text-3xl font-semibold">Bienvenue sur SUPRSS</h1>
<p className="text-neutral-600 mt-2">Zone protégée — vous êtes connecté(e).</p>
<p className="mt-6"><Link className="text-blue-600" to="/login">Aller à la page de connexion</Link></p>
</div>
</div>
)


export default function App() {
return (
<Routes>
{/* Auth */}
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
<Route path="/verify-email" element={<VerifyEmailPage />} />
<Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />


{/* Protected */}
<Route
path="/"
element={
<ProtectedRoute>
<Home />
</ProtectedRoute>
}
/>
</Routes>
)
}