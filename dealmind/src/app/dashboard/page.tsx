import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DealMind</h1>
              <p className="text-sm text-gray-600">Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                {user.user_metadata.tenant_id && (
                  <p className="text-xs text-gray-500">
                    Tenant: {user.user_metadata.tenant_id}
                  </p>
                )}
                {user.user_metadata.role && (
                  <p className="text-xs text-gray-500">
                    Cargo: {user.user_metadata.role}
                  </p>
                )}
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900">Bem-vindo ao DealMind!</h2>
          <p className="mt-2 text-gray-600">
            Você está autenticado com sucesso. Esta é a página inicial do dashboard.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">✓</span>
              <span>Sessão ativa e persistente</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">✓</span>
              <span>Middleware validando autenticação</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">✓</span>
              <span>Multi-tenancy configurado</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
