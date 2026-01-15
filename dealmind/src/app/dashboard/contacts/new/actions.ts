'use server'

import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string | null
  const phone = formData.get('phone') as string | null
  const company = formData.get('company') as string | null
  const position = formData.get('position') as string | null
  const source = formData.get('source') as string | null
  const notes = formData.get('notes') as string | null

  if (!name) {
    redirect('/dashboard/contacts/new')
  }

  // Call tRPC to create contact
  const { createCaller } = await import('~/server/api/root')
  const { createTRPCContext } = await import('~/server/api/trpc')

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    await caller.contact.create({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      position: position || null,
      source: source || null,
      notes: notes || null,
    })
  } catch (error) {
    console.error('Error creating contact:', error)
    return { error: 'Failed to create contact' }
  }

  revalidatePath('/dashboard/contacts')
  redirect('/dashboard/contacts')
}
