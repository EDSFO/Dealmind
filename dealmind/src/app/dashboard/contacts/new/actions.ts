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

  const fullName = formData.get('name') as string
  const email = formData.get('email') as string | null
  const phone = formData.get('phone') as string | null
  const company = formData.get('company') as string | null
  const position = formData.get('position') as string | null
  const source = formData.get('source') as string | null
  const notes = formData.get('notes') as string | null

  if (!fullName) {
    redirect('/dashboard/contacts/new')
  }

  // Call tRPC to create contact
  const { createCaller } = await import('~/server/api/root')
  const { createTRPCContext } = await import('~/server/api/trpc')

  const ctx = await createTRPCContext({
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/)
  const lastName = lastNameParts.join(' ')

  const sourceMap: Record<string, string> = {
    WEBSITE: 'WEBSITE',
    SOCIAL_MEDIA: 'SOCIAL_MEDIA',
    REFERRAL: 'REFERRAL',
    EVENT: 'EVENT',
    ADVERTISING: 'ADVERTISING',
    OUTBOUND: 'OUTBOUND',
    OTHER: 'OTHER',
    website: 'WEBSITE',
    linkedin: 'SOCIAL_MEDIA',
    instagram: 'SOCIAL_MEDIA',
    indicação: 'REFERRAL',
    evento: 'EVENT',
    campanha: 'ADVERTISING',
    frio: 'OUTBOUND',
    outro: 'OTHER',
  }

  try {
    await caller.contact.create({
      firstName: firstName ?? fullName,
      lastName: lastName || undefined,
      email: email || undefined,
      mobilePhone: phone || undefined,
      whatsapp: phone || undefined,
      company: company || undefined,
      position: position || undefined,
      source: source ? (sourceMap[source] as any) : undefined,
      internalNotes: notes || undefined,
    })
  } catch (error) {
    console.error('Error creating contact:', error)
    redirect('/dashboard/contacts/new?error=true')
  }

  revalidatePath('/dashboard/contacts')
  redirect('/dashboard/contacts')
}
