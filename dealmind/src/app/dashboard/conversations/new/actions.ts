'use server'

import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createManualConversation(formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const contactId = formData.get('contactId') as string | null
  const dealId = formData.get('dealId') as string | null
  const subject = formData.get('subject') as string | null
  const conversationDate = formData.get('conversationDate') as string | null
  const participants = formData.get('participants') as string | null
  const transcriptionText = formData.get('transcriptionText') as string

  if (!transcriptionText) {
    redirect('/dashboard/conversations/new')
  }

  // Parse participants from comma-separated string
  const participantsArray = participants
    ? participants.split(',').map(p => p.trim()).filter(p => p.length > 0)
    : []

  // Call tRPC to create conversation
  const { createCaller } = await import('~/server/api/root')
  const { createTRPCContext } = await import('~/server/api/trpc')

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    await caller.conversation.createManual({
      contactId: contactId || undefined,
      dealId: dealId || undefined,
      subject: subject || undefined,
      conversationDate: conversationDate || undefined,
      participants: participantsArray,
      transcriptionText,
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    // Return error or redirect with error state
    redirect('/dashboard/conversations/new?error=true')
  }

  revalidatePath('/dashboard/conversations')
  redirect('/dashboard/conversations')
}
