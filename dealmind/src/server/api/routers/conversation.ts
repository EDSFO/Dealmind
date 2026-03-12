import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";
import { checkPlanLimits } from "~/server/lib/plan-limits";
import { Prisma } from "../../../../generated/prisma";

const MessageType = z.enum(["NOTE", "EMAIL", "CALL", "MEETING", "WHATSAPP"]);
const ConversationSource = z.enum(["FIREFLIES", "WHATSAPP", "MANUAL"]);
const ProcessingStatus = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

export const conversationRouter = createTRPCRouter({
  // Listar conversas do tenant
  list: protectedProcedure
    .input(
      z.object({
        dealId: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const currentUser = await ensureUser(db, session);
      const where: any = {
        tenantId: currentUser.tenantId,
      };

      if (input?.dealId) {
        where.dealId = input.dealId;
      }

      if (input?.status) {
        where.processingStatus = input.status;
      }

      return db.conversation.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          deal: {
            select: {
              id: true,
              title: true,
              value: true,
            },
          },
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: { messages: true },
          },
        },
      });
    }),

  // Buscar conversa por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const currentUser = await ensureUser(db, session);

      return db.conversation.findFirst({
        where: {
          id: input.id,
          tenantId: currentUser.tenantId,
        },
        include: {
          deal: {
            select: {
              id: true,
              title: true,
              value: true,
              stage: {
                select: {
                  id: true,
                  name: true,
                  key: true,
                  color: true,
                  order: true,
                },
              },
            },
          },
          contact: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              // Sender info is stored as type/id, resolve dynamically on client
            },
          },
          insight: true,
        },
      });
    }),

  // Criar conversa manual com transcrição
  createManual: protectedProcedure
    .input(
      z.object({
        dealId: z.string().optional(),
        contactId: z.string().optional(),
        transcriptionText: z.string().min(1, "Transcrição é obrigatória"),
        participants: z.array(z.string()).optional(),
        conversationDate: z.string().or(z.date()).optional(),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const currentUser = await ensureUser(db, session);
      const tenantId = currentUser.tenantId;
      const userId = currentUser.id;

      // Check plan limits
      await checkPlanLimits(tenantId, 'conversations');

      // Se dealId fornecido, verificar se pertence ao tenant
      if (input.dealId) {
        const deal = await db.deal.findFirst({
          where: {
            id: input.dealId,
            tenantId: tenantId,
          },
        });

        if (!deal) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Deal não encontrado",
          });
        }
      }

      // Se contactId fornecido, verificar se pertence ao tenant
      if (input.contactId) {
        const contact = await db.contact.findFirst({
          where: {
            id: input.contactId,
            tenantId: tenantId,
          },
        });

        if (!contact) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Contato não encontrado",
          });
        }
      }

      // Criar conversa com status PENDING para processamento
      const conversation = await db.conversation.create({
        data: {
          tenantId,
          userId,
          dealId: input.dealId,
          contactId: input.contactId,
          source: "MANUAL",
          transcriptionText: input.transcriptionText,
          participants: input.participants || [],
          conversationDate: input.conversationDate
            ? new Date(input.conversationDate)
            : new Date(),
          processingStatus: "PENDING",
          subject: input.subject,
        },
        include: {
          deal: {
            select: {
              id: true,
              title: true,
            },
          },
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Analisar com OpenAI (substitui N8N)
      const { analyzeConversation } = await import("~/server/lib/openai-analyzer");
      await analyzeConversation({
        conversationId: conversation.id,
        tenantId: conversation.tenantId,
        transcriptionText: conversation.transcriptionText ?? "",
        dealId: conversation.dealId ?? undefined,
        contactId: conversation.contactId ?? undefined,
        subject: conversation.subject ?? undefined,
        conversationDate: conversation.conversationDate ?? undefined,
      }).then(async (result) => {
        if (result.success && result.insights) {
          // Create insight from OpenAI analysis
          await db.insight.upsert({
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
          });

          // Process extracted data for CRM
          if (result.insights.extractedData) {
            const { processExtractedData } = await import("~/server/lib/crm-extractor");
            await processExtractedData(
              db,
              conversation.tenantId,
              userId,
              conversation.id,
              result.insights.extractedData
            );
          }

          // Update conversation status
          await db.conversation.update({
            where: { id: conversation.id },
            data: { processingStatus: "COMPLETED" },
          });

          console.log("[Conversation] OpenAI analysis complete:", conversation.id);
        } else {
          throw new Error(result.error || "Analysis failed");
        }
      }).catch(async (error) => {
        console.error("[Conversation] OpenAI analysis failed:", error);
        // Mark as failed but don't throw - conversation is still created
        await db.conversation.update({
          where: { id: conversation.id },
          data: {
            processingStatus: "FAILED",
            errorReason: error instanceof Error ? error.message : "Unknown error",
          },
        });
      });

      return conversation;
    }),

  // Adicionar mensagem à conversa
  addMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1),
        type: MessageType.default("NOTE"),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, tenantId: true },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Verificar se conversa existe e pertence ao tenant
      const conversation = await db.conversation.findFirst({
        where: {
          id: input.conversationId,
          tenantId: currentUser.tenantId,
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversa não encontrada",
        });
      }

      // Criar mensagem e atualizar updatedAt da conversa
      await db.$transaction([
        db.message.create({
          data: {
            conversationId: input.conversationId,
            senderId: session.user.id,
            senderType: "user",
            type: input.type,
            content: input.content,
            metadata: input.metadata,
          },
        }),
        db.conversation.update({
          where: { id: input.conversationId },
          data: { updatedAt: new Date() },
        }),
      ]);

      return { success: true };
    }),

  // Atualizar status da conversa
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        processingStatus: ProcessingStatus,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const currentUser = await ensureUser(db, session);
      const tenantId = currentUser.tenantId;

      const conversation = await db.conversation.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversa não encontrada",
        });
      }

      return db.conversation.update({
        where: { id: input.id },
        data: { processingStatus: input.processingStatus },
      });
    }),

  // Excluir conversa
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const currentUser = await ensureUser(db, session);
      const tenantId = currentUser.tenantId;

      const conversation = await db.conversation.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversa não encontrada",
        });
      }

      return db.conversation.delete({
        where: { id: input.id },
      });
    }),
});
