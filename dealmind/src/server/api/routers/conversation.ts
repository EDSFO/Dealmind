import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

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
        where.status = input.status;
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

      // Enviar para N8N para processamento assíncrono (Story 3.5)
      const { sendToN8N } = await import("~/server/lib/n8n");
      await sendToN8N({
        conversationId: conversation.id,
        tenantId: conversation.tenantId,
        transcriptionText: conversation.transcriptionText ?? "",
        dealId: conversation.dealId ?? undefined,
        contactId: conversation.contactId ?? undefined,
        subject: conversation.subject ?? undefined,
        conversationDate: conversation.conversationDate ?? undefined,
      }).catch((error) => {
        console.error("[Conversation] Failed to send to N8N:", error);
        // Don't throw - conversation is created, just log the error
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
