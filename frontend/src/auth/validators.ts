import { z } from 'zod'


export const loginSchema = z.object({
  email: z.union([
    z.string().email("Email invalide"),
    z.string().min(2, "Email ou nom d’utilisateur requis"),
  ]),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z
.object({
email: z.string().email('Email invalide'),
username: z.string().min(3, 'Min 3 caractères').max(32, 'Max 32 caractères'),
password: z.string().min(8, 'Au moins 8 caractères'),
confirm: z.string(),
})
.refine((d) => d.password === d.confirm, {
path: ['confirm'],
message: 'Les mots de passe ne correspondent pas',
})


export const forgotSchema = z.object({ email: z.string().email('Email invalide') })
export const resetSchema = z.object({ password: z.string().min(8, 'Au moins 8 caractères') })