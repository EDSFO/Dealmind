'use server'

import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createDeal(formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const value = parseFloat(formData.get('value') as string)
  const stage = formData.get('stage') as string
  const priority = formData.get('priority') as string
  const contactId = formData.get('contactId') as string | null
  const expectedClose = formData.get('expectedClose') as string | null

  if (!title || isNaN(value)) {
    redirect('/dashboard/deals/new')
  }

  // Call tRPC to create deal
  const { createCaller } = await import('~/server/api/root')
  const { createTRPCContext } = await import('~/server/api/trpc')

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    const deal = await caller.deal.create({
      title,
      description: description || null,
      value,
      stage: stage as any,
      priority: priority as any,
      contactId: contactId || null,
      expectedClose: expectedClose ? new Date(expectedClose) : null,
    })

    revalidatePath('/dashboard/deals')
    redirect(`/dashboard/deals/${deal.id}`)
  } catch (error) {
    console.error('Error creating deal:', error)
    return { error: 'Failed to create deal' }
  }
}
