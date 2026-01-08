'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/react'

const roles = [
  { value: 'VENDEDOR', label: 'Vendedor', description: 'Pode ver e gerenciar apenas suas próprias conversas' },
  { value: 'LIDER', label: 'Líder', description: 'Pode ver todas as conversas da equipe e dashboards' },
  { value: 'ADMIN', label: 'Administrador', description: 'Pode gerenciar usuários, integrações e configurações' },
]

export default function NewUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    role: 'VENDEDOR' as const,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const createInvite = api.invite.create.useMutation({
    onSuccess: (data) => {
      setGeneratedLink(data.inviteLink)
      setLoading(false)
    },
    onError: (err) => {
      setError(err.message)
      setLoading(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setGeneratedLink(null)

    if (!formData.email || !formData.email.includes('@')) {
      setError('Digite um email válido')
      return
    }

    setLoading(true)
    createInvite.mutate({ email: formData.email, role: formData.role })
  }

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      alert('Link copiado para a área de transferência!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 pt-16">
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <Link href="/" className="text-2xl font-bold text-white">DealMind</Link>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/dashboard/users" className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-6">
            <Link href="/dashboard/users" className="mr-4 flex items-center text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Convidar Usuário</h1>
              <p className="text-sm text-gray-500">Adicione um novo membro à sua equipe</p>
            </div>
          </header>

          <main className="p-6">
            <div className="mx-auto max-w-2xl">
              {/* Link Gerado */}
              {generatedLink && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium text-green-700">Convite criado com sucesso!</p>
                  </div>

                  <p className="text-sm text-green-600 mb-3">
                    Copie o link abaixo e envie para o usuário:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-green-500">
                    Este link expira em 7 dias.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedLink(null)
                      setFormData({ email: '', role: 'VENDEDOR' })
                    }}
                    className="mt-4 text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    Criar outro convite →
                  </button>
                </div>
              )}

              {/* Formulário */}
              {!generatedLink && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email do usuário
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="usuario@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Função do usuário
                      </label>
                      <div className="space-y-3">
                        {roles.map((role) => (
                          <label
                            key={role.value}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                              formData.role === role.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={formData.role === role.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{role.label}</p>
                              <p className="text-sm text-gray-500">{role.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Link
                        href="/dashboard/users"
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </Link>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Criando...
                          </span>
                        ) : (
                          'Gerar Link de Convite'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
