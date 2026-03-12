'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '~/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { api } from '~/trpc/react'

// Validation schema for registration without company
const registrationBaseSchema = z.object({
  name: z.string().min(2, 'Seu nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string()
})

const registrationSchema = registrationBaseSchema.refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type RegistrationFormData = z.infer<typeof registrationSchema>

function RegisterPageContent() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Validar convite se existir
  const { data: inviteData, isLoading: inviteLoading } = api.invite.validate.useQuery(
    { token: inviteToken || '' },
    { enabled: !!inviteToken }
  )

  const useInvite = api.invite.use.useMutation({
    onSuccess: () => {
      setSuccess('Conta criada com sucesso! Redirecionando...')
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    },
    onError: (err) => {
      setError(err.message)
      setLoading(false)
    },
  })

  const handleSocialLogin = async (provider: 'google') => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError('Erro ao fazer login com ' + (provider === 'google' ? 'Google' : ''))
      }
    } catch {
      setError('Não foi possível conectar ao provedor de login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setError(null)
  }

  const validateField = (name: string, value: string) => {
    try {
      const testSchema = registrationBaseSchema.shape[name as keyof typeof registrationBaseSchema.shape]
      if (testSchema) {
        testSchema.parse(value)
        setErrors(prev => ({ ...prev, [name]: '' }))
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [name]: err.errors[0]?.message || 'Inválido' }))
      }
    }
  }

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'Pelo menos 8 caracteres' },
    { met: /[A-Z]/.test(formData.password), text: 'Uma letra maiúscula' },
    { met: /[0-9]/.test(formData.password), text: 'Um número' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setErrors({})
    setLoading(true)

    try {
      const validatedData = registrationSchema.parse(formData)

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.name,
          }
        }
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('Este e-mail já está cadastrado')
        }
        if (authError.message.includes('Password should be')) {
          throw new Error('A senha não atende aos requisitos mínimos')
        }
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário')
      }

      if (inviteToken && inviteData?.valid) {
        // Usar convite - vincula ao tenant existente
        useInvite.mutate({ token: inviteToken, userId: authData.user.id })
      } else {
        // Criar novo tenant e empresa (fluxo original)
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authData.user.id,
            companyName: 'Minha Empresa', // Default
            name: validatedData.name,
            email: validatedData.email
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erro ao criar registro')
        }

        setSuccess('Conta criada com sucesso! Redirecionando...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.errors.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0] as string] = e.message
          }
        })
        setErrors(fieldErrors)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (inviteToken && inviteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316] mx-auto"></div>
          <p className="mt-4 text-zinc-400">Validando convite...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-white">
            Deal<span className="text-[#f97316]">Mind</span>
          </Link>
          <p className="mt-2 text-sm text-zinc-400">
            {inviteData?.valid
              ? `Você foi convidado para ingressar na equipe como ${inviteData.role}`
              : 'Crie sua conta para começar'}
          </p>
        </div>

        {/* Convite Inválido */}
        {inviteToken && inviteData && !inviteData.valid && (
          <div className="mb-6 rounded-lg bg-red-900/20 border border-red-800/50 p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-400">{inviteData.error || 'Convite inválido'}</p>
            </div>
          </div>
        )}

        {/* Card de Registro - Luminous Dark Theme */}
        <div className="rounded-2xl bg-[#0f0f0f] p-8 shadow-[0_0_30px_rgba(249,115,22,0.1),inset_0_0_20px_rgba(249,115,22,0.05)] border border-[#27272a]">
          {error && (
            <div className="mb-6 rounded-lg bg-red-900/20 border border-red-800/50 p-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-900/20 border border-green-800/50 p-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-400">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Completo */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                Seu Nome Completo
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={(e) => validateField('name', e.target.value)}
                  className={`block w-full rounded-lg border px-10 py-3 shadow-sm focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]/30 transition-colors bg-[#141414] ${
                    errors.name ? 'border-red-800 bg-red-900/10' : 'border-[#3f3f46] text-white placeholder-zinc-500'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                E-mail
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => validateField('email', e.target.value)}
                  className={`block w-full rounded-lg border px-10 py-3 shadow-sm focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]/30 transition-colors bg-[#141414] ${
                    errors.email ? 'border-red-800 bg-red-900/10' : 'border-[#3f3f46] text-white placeholder-zinc-500'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Senha
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border px-10 py-3 pr-20 shadow-sm focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]/30 transition-colors bg-[#141414] ${
                    errors.password ? 'border-red-800 bg-red-900/10' : 'border-[#3f3f46] text-white placeholder-zinc-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <svg className={`h-4 w-4 ${req.met ? 'text-green-500' : 'text-zinc-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {req.met ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        )}
                      </svg>
                      <span className={req.met ? 'text-green-400' : 'text-zinc-500'}>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
                Confirmar Senha
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border px-10 py-3 shadow-sm focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]/30 transition-colors bg-[#141414] ${
                    errors.confirmPassword ? 'border-red-800 bg-red-900/10' : 'border-[#3f3f46] text-white placeholder-zinc-500'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">As senhas não coincidem</p>
              )}
            </div>

            {/* Botão Criar Conta */}
            <button
              type="submit"
              disabled={loading || (!!inviteToken && !inviteData?.valid)}
              className="w-full rounded-lg bg-gradient-to-r from-[#f97316] to-[#fb923c] px-4 py-3 text-base font-semibold text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 focus:ring-offset-[#0f0f0f] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Criando conta...
                </span>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#27272a]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#0f0f0f] px-4 text-zinc-500">ou cadastre-se com</span>
            </div>
          </div>

          {/* Login Social */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3f3f46] bg-[#141414] px-4 py-3 text-sm font-medium text-zinc-300 shadow-sm hover:bg-[#1a1a1a] hover:border-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 focus:ring-offset-[#0f0f0f] disabled:opacity-50 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="#" className="text-[#f97316] hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="#" className="text-[#f97316] hover:underline">Política de Privacidade</Link>
          </p>
        </div>

        <p className="text-center text-sm text-zinc-400">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-semibold text-[#f97316] hover:text-[#fb923c]">
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}

