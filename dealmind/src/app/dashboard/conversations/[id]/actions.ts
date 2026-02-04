'use server'

import { createClient } from '~/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { analyzeConversation } from '~/server/lib/openai-analyzer'

export async function retryProcessing(conversationId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Não autorizado' }
  }

  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  try {
    // Buscar a conversa
    const conversation = await caller.conversation.byId({ id: conversationId })

    if (!conversation) {
      return { error: 'Conversa não encontrada' }
    }

    // Verificar se tem transcrição
    if (!conversation.transcriptionText) {
      return { error: 'Conversa não possui transcrição para processar' }
    }

    // Atualizar status para PROCESSING
    await caller.conversation.updateStatus({
      id: conversationId,
      processingStatus: 'PROCESSING',
    })

    // Enviar para OpenAI
    const result = await analyzeConversation({
      conversationId: conversation.id,
      tenantId: conversation.tenantId,
      transcriptionText: conversation.transcriptionText ?? "",
      dealId: conversation.dealId ?? undefined,
      contactId: conversation.contactId ?? undefined,
      subject: conversation.subject ?? undefined,
      conversationDate: conversation.conversationDate ?? undefined,
    })

    if (!result.success) {
      throw new Error(result.error || 'Erro na análise')
    }

    // Revalidar a página
    revalidatePath(`/dashboard/conversations/${conversationId}`)
    revalidatePath('/dashboard/conversations')

    return { success: true }
  } catch (error) {
    console.error('Error retrying processing:', error)
    return { error: 'Erro ao reenviar para processamento' }
  }
}


