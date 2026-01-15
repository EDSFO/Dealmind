'use server'

import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { createClient } from '~/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createActivity(formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Não autorizado')
  }

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  const dealId = formData.get('dealId') as string
  const type = formData.get('type') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const dueAt = formData.get('dueAt') as string | null

  await caller.activity.create({
    dealId: dealId || undefined,
    type,
    title,
    description: description || undefined,
    dueAt: dueAt ? new Date(dueAt) : undefined,
  })

  revalidatePath(`/dashboard/deals/${dealId}`)
}

export async function completeActivity(activityId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Não autorizado')
  }

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  await caller.activity.complete({ id: activityId })

  // Get the activity to know which deal to revalidate
  const activities = await caller.activity.list()
  const activity = activities.find((a: any) => a.id === activityId)

  if (activity?.dealId) {
    revalidatePath(`/dashboard/deals/${activity.dealId}`)
  }
}
