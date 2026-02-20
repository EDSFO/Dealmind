'use server'

import { createClient } from '~/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { analyzeConversation } from '~/server/lib/openai-analyzer'
import { processExtractedData } from '~/server/lib/crm-extractor'
import { Prisma } from '../../../../../generated/prisma'

export async function retryProcessing(conversationId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Não autorizado' }
  }

  const ctx = await createTRPCContext({
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

    if (!result.insights) {
      throw new Error('Análise retornou sem insights')
    }

    await ctx.db.insight.upsert({
      where: { conversationId: conversation.id },
      create: {
        conversationId: conversation.id,
        interests: result.insights.interests || [],
        objections: result.insights.objections || [],
        commitments: result.insights.commitments || [],
        progressSignals: result.insights.progressSignals || [],
        riskSignals: result.insights.riskSignals || [],
        nextActions: result.insights.nextActions || [],
        summary: result.insights.summary,
        extractedData: result.insights.extractedData
          ? (result.insights.extractedData as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
      update: {
        interests: result.insights.interests || [],
        objections: result.insights.objections || [],
        commitments: result.insights.commitments || [],
        progressSignals: result.insights.progressSignals || [],
        riskSignals: result.insights.riskSignals || [],
        nextActions: result.insights.nextActions || [],
        summary: result.insights.summary,
        extractedData: result.insights.extractedData
          ? (result.insights.extractedData as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    })

    if (result.insights.extractedData) {
      await processExtractedData(
        ctx.db,
        conversation.tenantId,
        session.user.id,
        conversation.id,
        result.insights.extractedData,
      )
    }

    await caller.conversation.updateStatus({
      id: conversationId,
      processingStatus: 'COMPLETED',
    })

    // Revalidar a página
    revalidatePath(`/dashboard/conversations/${conversationId}`)
    revalidatePath('/dashboard/conversations')

    return { success: true }
  } catch (error) {
    console.error('Error retrying processing:', error)
    await caller.conversation.updateStatus({
      id: conversationId,
      processingStatus: 'FAILED',
    }).catch(() => null)
    return { error: 'Erro ao reenviar para processamento' }
  }
}

export async function createActionsFromInsights(conversationId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Não autorizado' }
  }

  const ctx = await createTRPCContext({
    headers: new Headers(),
  })

  try {
    const conversation = await ctx.db.conversation.findUnique({
      where: { id: conversationId },
      include: { insight: true }
    })

    if (!conversation) {
      return { error: 'Conversa não encontrada' }
    }

    if (!conversation.dealId) {
      return { error: 'A conversa não está associada a um negócio' }
    }

    if (!conversation.insight) {
      return { error: 'A conversa não possui insights de IA gerados' }
    }

    const { nextActions } = conversation.insight as any;

    if (!nextActions || !Array.isArray(nextActions) || nextActions.length === 0) {
      return { error: 'Nenhuma próxima ação encontrada nos insights' }
    }

    let createdCount = 0;

    for (const action of nextActions) {
      // Cria uma atividade para cada next action
      // Adiciona um prazo de 1 dia para a tarefa (apenas um default razoável)
      const dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + 1);

      await ctx.db.activity.create({
        data: {
          tenantId: conversation.tenantId,
          userId: session.user.id,
          dealId: conversation.dealId,
          type: 'FOLLOW_UP',
          title: action.substring(0, 100), // Ensure title length is reasonable
          description: `Tarefa extraída automaticamente dos insights da IA da conversa: ${conversation.subject || 'Sem assunto'}.`,
          status: 'PENDING',
          dueAt: dueAt,
        }
      });
      createdCount++;
    }

    revalidatePath(`/dashboard/conversations/${conversationId}`)
    revalidatePath(`/dashboard/deals/${conversation.dealId}`)

    return { success: true, created: createdCount }
  } catch (error) {
    console.error('Error creating actions:', error)
    return { error: 'Erro ao criar tarefas' }
  }
}

