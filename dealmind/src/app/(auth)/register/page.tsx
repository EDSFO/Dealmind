'use client'

import { useState } from 'react'
import { createClient } from '~/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'

// Validation schema
const registrationSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa é obrigatório'),
  name: z.string().min(2, 'Seu nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    companyName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Validate form data
      const validatedData = registrationSchema.parse(formData)

      // Create Supabase auth user with custom metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.name,
            tenant_id: '', // Will be updated after tenant creation
            role: 'ADMIN'
          }
        }
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('Este e-mail já está cadastrado')
        }
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário')
      }

      // Create database records via API route
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          companyName: validatedData.companyName,
          name: validatedData.name,
          email: validatedData.email
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar registro')
      }

      setSuccess('Conta criada com sucesso! Redirecionando...')

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)

    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Erro de validação')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            DealMind
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crie sua conta para começar
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Nome da Empresa
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Minha Empresa Ltda"
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Seu Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="João Silva"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
