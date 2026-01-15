'use server'

import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateDeal(dealId: string, field: string, value: any) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Unauthorized' }
  }

  if (!dealId) {
    return { error: 'Deal ID required' }
  }

  const { createCaller } = await import('~/server/api/root')
  const { createTRPCContext } = await import('~/server/api/trpc')

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    // Build the update data
    const updateData: any = { id: dealId }

    if (field === 'title') {
      updateData.title = value
    } else if (field === 'description') {
      updateData.description = value
    } else if (field === 'value') {
      updateData.value = parseFloat(value)
    } else if (field === 'priority') {
      updateData.priority = value
    } else {
      return { error: 'Invalid field' }
    }

    await caller.deal.update(updateData)
    revalidatePath(`/dashboard/deals/${dealId}`)
    revalidatePath('/dashboard/deals')
    return { success: true }
  } catch (error) {
    console.error('Error updating deal:', error)
    return { error: 'Failed to update deal' }
  }
}

export async function updateDealStage(formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const dealId = formData.get('dealId') as string
  const stage = formData.get('stage') as string

  if (!dealId || !stage) {
    redirect('/dashboard/deals')
  }

  // Call tRPC to update
  const { createCaller } = await import('~/server/api/root')
  const { createTRPCContext } = await import('~/server/api/trpc')

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    await caller.deal.updateStage({ id: dealId, stage: stage as any })
  } catch (error) {
    console.error('Error updating deal stage:', error)
  }

  revalidatePath(`/dashboard/deals/${dealId}`)
  revalidatePath('/dashboard/deals')
  redirect(`/dashboard/deals/${dealId}`)
}

export async function deleteDeal(dealId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { createCaller } = await import('~/server/api/root')
  const { createTRPCContext } = await import('~/server/api/trpc')

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    await caller.deal.delete({ id: dealId })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return { error: 'Failed to delete deal' }
  }

  redirect('/dashboard/deals')
}
