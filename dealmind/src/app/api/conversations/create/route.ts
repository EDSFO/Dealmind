import { createClient } from '~/lib/supabase/server'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    const subject = formData.get('subject') as string | null
    const dealId = formData.get('dealId') as string | null
    const status = formData.get('status') as string || 'open'

    const conversation = await caller.conversation.create({
      dealId: dealId || undefined,
      subject: subject || undefined,
      status,
    })

    return NextResponse.json({ success: true, conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Erro ao criar conversa' }, { status: 500 })
  }
}
