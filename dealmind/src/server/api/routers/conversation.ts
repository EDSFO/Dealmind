import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

const MessageType = z.enum(["NOTE", "EMAIL", "CALL", "MEETING", "WHATSAPP"]);

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
              stage: true,
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

  // Criar nova conversa
  create: protectedProcedure
    .input(
      z.object({
        dealId: z.string().optional(),
        contactId: z.string().optional(),
        subject: z.string().optional(),
        status: z.string().default("open"),
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

      return db.conversation.create({
        data: {
          tenantId: tenantId,
          ...input,
        },
      });
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

      const currentUser = await ensureUser(db, session);
      const tenantId = currentUser.tenantId;

      return db.conversation.create({
        data: {
          tenantId: currentUser.tenantId,
          ...input,
        },
      });
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
          tenantId: tenantId,
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
        status: z.string(),
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
        data: { status: input.status },
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
