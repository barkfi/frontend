import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card, CardTitle } from '@/components/ui/card'
import type { ApiResponse, Utilisateur } from '@/types'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [error, setError] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post<ApiResponse<{ user: Utilisateur; token: string }>>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      setAuth(res.data.data.user, res.data.data.token)
      navigate('/')
    } catch {
      setError('Identifiants invalides')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold text-primary">StockFlow</p>
          <p className="text-sm text-slate-500">Système de gestion de stock multi-entrepôts</p>
        </div>
        <CardTitle className="mb-4">Se connecter</CardTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className="mt-1" />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" {...register('password')} className="mt-1" />
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>
          {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-danger dark:bg-rose-950">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">admin@stockflow.com / password</p>
      </Card>
    </div>
  )
}
