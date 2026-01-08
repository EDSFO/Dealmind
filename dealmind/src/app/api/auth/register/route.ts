import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from '~/server/db'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, companyName, name, email } = body

    // Validate required fields
    if (!userId || !companyName || !name || !email) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Generate unique tenant ID
    const tenantId = randomUUID()

    // Create all records in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          id: tenantId,
          name: companyName
        }
      })

      // Create Company linked to tenant
      const company = await tx.company.create({
        data: {
          tenantId: tenant.id,
          name: companyName
        }
      })

      // Create User with ADMIN role
      const user = await tx.user.create({
        data: {
          id: userId,
          tenantId: tenant.id,
          companyId: company.id,
          email,
          name,
          role: 'ADMIN'
        }
      })

      return { tenant, company, user }
    })

    // Update Supabase Auth user metadata with tenant_id
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          }
        }
      }
    )

    // Update user metadata with tenant_id
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          tenant_id: tenantId,
          role: 'ADMIN',
          full_name: name
        }
      }
    )

    if (updateError) {
      // Log but don't fail - the user is already created in our database
      console.error('Failed to update Supabase user metadata:', updateError)
    }

    return NextResponse.json({
      success: true,
      data: {
        tenantId: result.tenant.id,
        companyId: result.company.id,
        userId: result.user.id
      }
    })

  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Este e-mail já está cadastrado para esta empresa' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}
