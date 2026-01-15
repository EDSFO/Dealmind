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
    const conversationId = formData.get('conversationId') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string || 'NOTE'

    await caller.conversation.addMessage({
      conversationId,
      content,
      type: type as any,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding message:', error)
    return NextResponse.json({ error: 'Erro ao adicionar mensagem' }, { status: 500 })
  }
}
