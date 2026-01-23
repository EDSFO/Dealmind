import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

const TicketTypeSchema = z.enum([
  "SUPPORT",
  "BILLING",
  "TECHNICAL",
  "FEATURE_REQUEST",
  "BUG_REPORT",
  "QUESTION",
  "OTHER",
]);

const TicketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const TicketStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
]);

export const ticketRouter = createTRPCRouter({
  // Listar tickets do tenant com filtros
  list: protectedProcedure
    .input(
      z.object({
        status: TicketStatusSchema.optional(),
        type: TicketTypeSchema.optional(),
        priority: TicketPrioritySchema.optional(),
        companyId: z.string().optional(),
        contactId: z.string().optional(),
        dealId: z.string().optional(),
        ownerId: z.string().optional(),
        search: z.string().optional(),
        includeRelations: z.boolean().default(true),
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

      const user = await ensureUser(db, session);
      if (!user?.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não possui um tenant associado",
        });
      }

      const where: any = { tenantId: user.tenantId };

      if (input?.status) where.status = input.status;
      if (input?.type) where.type = input.type;
      if (input?.priority) where.priority = input.priority;
      if (input?.companyId) where.companyId = input.companyId;
      if (input?.contactId) where.contactId = input.contactId;
      if (input?.dealId) where.dealId = input.dealId;
      if (input?.ownerId) where.ownerId = input.ownerId;

      if (input?.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return db.ticket.findMany({
        where,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          company: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, name: true, email: true, phone: true },
          },
          deal: {
            select: { id: true, title: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }),

  // Buscar ticket por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const user = await ensureUser(db, session);
      if (!user?.tenantId) return null;

      return db.ticket.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
        include: {
          company: {
            select: { id: true, name: true },
          },
          contact: {
            select: { id: true, name: true, email: true, phone: true },
          },
          deal: {
            select: { id: true, title: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }),

  // Criar novo ticket
  create: protectedProcedure
    .input(
      z.object({
        // Identificação
        title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
        description: z.string().optional(),

        // Relacionamentos
        companyId: z.string().optional(),
        contactId: z.string().optional(),
        dealId: z.string().optional(),
        ownerId: z.string().optional(),

        // Classificação
        type: TicketTypeSchema.default("SUPPORT"),
        priority: TicketPrioritySchema.default("MEDIUM"),
        status: TicketStatusSchema.default("OPEN"),

        // Informações Adicionais
        source: z.string().optional(),
        tags: z.array(z.string()).optional(),
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

      const user = await ensureUser(db, session);

      if (!user?.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não possui um tenant associado.",
        });
      }

      // Validar relacionamentos
      if (input.companyId) {
        const company = await db.company.findFirst({
          where: { id: input.companyId, tenantId: user.tenantId },
        });
        if (!company) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Empresa não encontrada",
          });
        }
      }

      if (input.contactId) {
        const contact = await db.contact.findFirst({
          where: { id: input.contactId, tenantId: user.tenantId },
        });
        if (!contact) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Contato não encontrado",
          });
        }
      }

      if (input.dealId) {
        const deal = await db.deal.findFirst({
          where: { id: input.dealId, tenantId: user.tenantId },
        });
        if (!deal) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Negócio não encontrado",
          });
        }
      }

      if (input.ownerId) {
        const owner = await db.user.findFirst({
          where: { id: input.ownerId, tenantId: user.tenantId },
        });
        if (!owner) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Responsável não encontrado",
          });
        }
      }

      return db.ticket.create({
        data: {
          tenantId: user.tenantId,
          title: input.title,
          description: input.description || null,
          companyId: input.companyId || null,
          contactId: input.contactId || null,
          dealId: input.dealId || null,
          ownerId: input.ownerId || user.id, // Usa o próprio usuário como responsável se não especificado
          type: input.type,
          priority: input.priority,
          status: input.status,
          source: input.source || null,
          tags: input.tags || null,
        },
      });
    }),

  // Atualizar ticket
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),

        // Relacionamentos
        companyId: z.string().optional(),
        contactId: z.string().optional(),
        dealId: z.string().optional(),
        ownerId: z.string().optional(),

        // Classificação
        type: TicketTypeSchema.optional(),
        priority: TicketPrioritySchema.optional(),
        status: TicketStatusSchema.optional(),

        // SLA e Resolução
        dueAt: z.string().datetime().optional(),
        resolvedAt: z.string().datetime().optional(),
        closedAt: z.string().datetime().optional(),
        resolution: z.string().optional(),
        satisfactionScore: z.number().int().min(1).max(5).optional(),

        // Informações Adicionais
        source: z.string().optional(),
        tags: z.array(z.string()).optional(),
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

      const user = await ensureUser(db, session);

      // Verificar se ticket existe e pertence ao tenant
      const ticket = await db.ticket.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket não encontrado",
        });
      }

      // Construir objeto de atualização apenas com campos fornecidos
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.companyId !== undefined) updateData.companyId = input.companyId || null;
      if (input.contactId !== undefined) updateData.contactId = input.contactId || null;
      if (input.dealId !== undefined) updateData.dealId = input.dealId || null;
      if (input.ownerId !== undefined) updateData.ownerId = input.ownerId;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.dueAt !== undefined) updateData.dueAt = input.dueAt ? new Date(input.dueAt) : null;
      if (input.resolvedAt !== undefined) updateData.resolvedAt = input.resolvedAt ? new Date(input.resolvedAt) : null;
      if (input.closedAt !== undefined) updateData.closedAt = input.closedAt ? new Date(input.closedAt) : null;
      if (input.resolution !== undefined) updateData.resolution = input.resolution;
      if (input.satisfactionScore !== undefined) updateData.satisfactionScore = input.satisfactionScore;
      if (input.source !== undefined) updateData.source = input.source;
      if (input.tags !== undefined) updateData.tags = input.tags;

      return db.ticket.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  // Deletar ticket
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

      const user = await ensureUser(db, session);

      const ticket = await db.ticket.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket não encontrado",
        });
      }

      return db.ticket.delete({
        where: { id: input.id },
      });
    }),

  // Estatísticas de tickets
  stats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    if (!session?.user) {
      return null;
    }

    const user = await ensureUser(db, session);
    if (!user?.tenantId) return null;

    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      byType,
      byPriority,
      myTickets,
    ] = await Promise.all([
      db.ticket.count({ where: { tenantId: user.tenantId } }),
      db.ticket.count({
        where: { tenantId: user.tenantId, status: "OPEN" },
      }),
      db.ticket.count({
        where: { tenantId: user.tenantId, status: "IN_PROGRESS" },
      }),
      db.ticket.count({
        where: { tenantId: user.tenantId, status: "RESOLVED" },
      }),
      db.ticket.count({
        where: { tenantId: user.tenantId, status: "CLOSED" },
      }),
      db.ticket.groupBy({
        by: ["type"],
        where: { tenantId: user.tenantId },
        _count: true,
      }),
      db.ticket.groupBy({
        by: ["priority"],
        where: { tenantId: user.tenantId },
        _count: true,
      }),
      db.ticket.count({
        where: { tenantId: user.tenantId, ownerId: user.id },
      }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      myTickets,
      byType: byType.reduce((acc, s) => {
        acc[s.type] = s._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, s) => {
        acc[s.priority] = s._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }),
});
