import React from 'react'


const AuthLayout: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="min-h-screen grid place-items-center bg-neutral-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border">
            <h1 className="text-2xl font-semibold mb-1 text-center">{title}</h1>
            {subtitle && <p className="text-sm text-neutral-600 text-center mb-6">{subtitle}</p>}
            {children}
            <p className="mt-6 text-xs text-center text-neutral-500">© {new Date().getFullYear()} SUPRSS</p>
        </div>
    </div>
)
export default AuthLayout