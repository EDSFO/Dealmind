import { createClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { dealId, stage } = body

    if (!dealId || !stage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ctx = await createTRPCContext({
      supabase,
      headers: new Headers(),
    })
    const caller = createCaller(ctx)

    await caller.deal.updateStage({ id: dealId, stage })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating deal stage:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}
