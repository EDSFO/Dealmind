import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

// Enum para stages - deve bater com o schema.prisma
const DealStage = z.enum(["LEAD", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]);
const DealPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const dealRouter = createTRPCRouter({
  // Listar deals do tenant
  list: protectedProcedure
    .input(
      z.object({
        stage: DealStage.optional(),
        ownerId: z.string().optional(),
        search: z.string().optional(),
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
      const tenantId = currentUser.tenantId;
      const userRole = currentUser.role;

      console.log('Fetching deals for tenantId:', tenantId, 'role:', userRole)

      const where: any = {
        tenantId: tenantId,
      };

      // Vendedores só veem seus próprios deals
      if (userRole === "VENDEDOR") {
        where.ownerId = session.user.id;
      }

      // Líderes podem ver deals de sua equipe
      if (userRole === "LIDER" && !input?.ownerId) {
        // TODO: Implementar filtragem por equipe
        where.ownerId = session.user.id;
      }

      if (input?.stage) {
        where.stage = input.stage;
      }

      if (input?.ownerId) {
        where.ownerId = input.ownerId;
      }

      if (input?.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return db.deal.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              company: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Buscar deal por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const currentUser = await ensureUser(db, session);
      const tenantId = currentUser.tenantId;

      const deal = await db.deal.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
        include: {
          contact: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          conversations: {
            include: {
              messages: {
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { updatedAt: "desc" },
          },
          activities: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return deal;
    }),

  // Criar novo deal
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        value: z.number().min(0),
        currency: z.string().default("BRL"),
        stage: DealStage.default("LEAD"),
        priority: DealPriority.default("MEDIUM"),
        contactId: z.string().nullable().optional(),
        expectedClose: z.date().nullable().optional(),
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

      // Validate contactId if provided
      if (input.contactId) {
        const contact = await db.contact.findFirst({
          where: {
            id: input.contactId,
            tenantId: tenantId,
          },
        });

        if (!contact) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Contato não encontrado ou não pertence ao seu tenant",
          });
        }
      }

      return db.deal.create({
        data: {
          tenantId: tenantId,
          ownerId: session.user.id,
          title: input.title,
          description: input.description,
          value: input.value,
          currency: input.currency,
          stage: input.stage,
          priority: input.priority,
          contactId: input.contactId,
          expectedClose: input.expectedClose,
        },
      });
    }),

  // Atualizar deal
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        value: z.number().min(0).optional(),
        stage: DealStage.optional(),
        priority: DealPriority.optional(),
        contactId: z.string().nullable().optional(),
        expectedClose: z.date().nullable().optional(),
        probability: z.number().min(0).max(100).optional(),
        lostReason: z.string().nullable().optional(),
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
      const userRole = currentUser.role;

      // Verificar se deal existe e pertence ao tenant
      const existingDeal = await db.deal.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!existingDeal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal não encontrado",
        });
      }

      // Verificar permissão (apenas owner ou ADMIN/LIDER pode editar)
      if (
        userRole === "VENDEDOR" &&
        existingDeal.ownerId !== session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para editar este deal",
        });
      }

      const data: any = { ...input };
      delete data.id;

      // Se mudou para CLOSED_WON, setar wonAt
      if (input.stage === "CLOSED_WON" && existingDeal.stage !== "CLOSED_WON") {
        data.wonAt = new Date();
      }

      return db.deal.update({
        where: { id: input.id },
        data,
      });
    }),

  // Atualizar stage do deal (para drag & drop no kanban)
  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        stage: DealStage,
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

      const existingDeal = await db.deal.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!existingDeal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal não encontrado",
        });
      }

      const data: any = { stage: input.stage };

      if (input.stage === "CLOSED_WON") {
        data.wonAt = new Date();
      }

      return db.deal.update({
        where: { id: input.id },
        data,
      });
    }),

  // Excluir deal
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
      const userRole = currentUser.role;

      const existingDeal = await db.deal.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!existingDeal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal não encontrado",
        });
      }

      // Apenas owner ou ADMIN pode excluir
      if (
        userRole !== "ADMIN" &&
        existingDeal.ownerId !== session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para excluir este deal",
        });
      }

      return db.deal.delete({
        where: { id: input.id },
      });
    }),

  // Estatísticas do pipeline
  pipelineStats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    if (!session?.user) {
      return null;
    }

    const currentUser = await ensureUser(db, session);
    const tenantId = currentUser.tenantId;
    const userRole = currentUser.role;

    const where: any = { tenantId: tenantId };

    // Vendedores só veem suas próprias métricas
    if (userRole === "VENDEDOR") {
      where.ownerId = session.user.id;
    }

    const [totalDeals, totalValue, byStage, wonThisMonth, lostThisMonth] = await Promise.all([
      db.deal.count({ where }),
      db.deal.aggregate({
        where,
        _sum: { value: true },
      }),
      db.deal.groupBy({
        by: ["stage"],
        where,
        _count: true,
        _sum: { value: true },
      }),
      db.deal.count({
        where: {
          ...where,
          stage: "CLOSED_WON",
          wonAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      db.deal.count({
        where: {
          ...where,
          stage: "CLOSED_LOST",
          updatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalDeals,
      totalValue: totalValue._sum.value?.toNumber() || 0,
      byStage: byStage.map((s) => ({
        stage: s.stage,
        count: s._count,
        value: s._sum.value?.toNumber() || 0,
      })),
      wonThisMonth,
      lostThisMonth,
    };
  }),
});
