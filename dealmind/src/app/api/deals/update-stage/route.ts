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
    const { dealId, stageId, stageKey, stage } = body

    if (!dealId || (!stageId && !stageKey && !stage)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ctx = await createTRPCContext({
      headers: new Headers(),
    })
    const caller = createCaller(ctx)

    const resolvedStageId = stageId ?? (
      await caller.pipelineStage.byKey({ key: stageKey ?? stage })
    )?.id

    if (!resolvedStageId) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }

    await caller.deal.updateStage({ id: dealId, stageId: resolvedStageId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating deal stage:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}
