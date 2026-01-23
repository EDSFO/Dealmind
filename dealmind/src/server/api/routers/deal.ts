import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

const DealPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

// Enum para canal de origem do negócio
const DealSourceChannelSchema = z.enum([
  "INBOUND",
  "OUTBOUND",
  "REFERRAL",
  "PARTNER",
  "EVENT",
  "ADVERTISING",
  "CONTENT",
  "SOCIAL_MEDIA",
  "WEBSITE",
  "EMAIL_MARKETING",
  "OTHER",
]);

export const dealRouter = createTRPCRouter({
  // Listar deals do tenant
  list: protectedProcedure
    .input(
      z.object({
        stageId: z.string().optional(),
        companyId: z.string().optional(),
        contactId: z.string().optional(),
        ownerId: z.string().optional(),
        sourceChannel: DealSourceChannelSchema.optional(),
        priority: DealPriority.optional(),
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

      if (input?.stageId) where.stageId = input.stageId;
      if (input?.companyId) where.companyId = input.companyId;
      if (input?.contactId) where.contactId = input.contactId;
      if (input?.ownerId) where.ownerId = input.ownerId;
      if (input?.sourceChannel) where.sourceChannel = input.sourceChannel;
      if (input?.priority) where.priority = input.priority;

      if (input?.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
          { clientProblem: { contains: input.search, mode: "insensitive" } },
          { productSolution: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const deals = await db.deal.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          stage: {
            select: {
              id: true,
              name: true,
              key: true,
              color: true,
              probability: true,
              order: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              whatsapp: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
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

      // Convert Decimal to string for JSON serialization
      return deals.map(deal => ({
        ...deal,
        value: deal.value.toString(),
        expectedClose: deal.expectedClose?.toISOString() ?? null,
        wonAt: deal.wonAt?.toISOString() ?? null,
      }));
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
          stage: {
            select: {
              id: true,
              name: true,
              key: true,
              color: true,
              probability: true,
              order: true,
            },
          },
          contact: true,
          company: true,
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

      if (!deal) return null;

      // Convert Decimal to string for JSON serialization
      return {
        ...deal,
        value: deal.value.toString(),
        expectedClose: deal.expectedClose?.toISOString() ?? null,
        wonAt: deal.wonAt?.toISOString() ?? null,
      };
    }),

  // Criar novo deal
  create: protectedProcedure
    .input(
      z.object({
        // 1. Identificação do Negócio
        title: z.string().min(1, "Título é obrigatório"),
        description: z.string().optional(),
        stageId: z.string().optional(),
        priority: DealPriority.default("MEDIUM"),

        // 2. Contexto Comercial (dor e motivação)
        clientProblem: z.string().optional(),
        opportunityReason: z.string().optional(),
        sourceChannel: DealSourceChannelSchema.optional(),

        // 3. Qualificação de Mercado
        marketSegment: z.string().optional(),
        productSolution: z.string().optional(),

        // 4. Valor e Métrica
        value: z.number().min(0, "Valor deve ser maior ou igual a 0"),
        quantity: z.number().int().min(0).optional(),
        currency: z.string().default("BRL"),

        // 5. Previsão e Probabilidade
        expectedClose: z.date().optional(),
        probability: z.number().int().min(0).max(100).optional(),

        // 6. Relacionamentos
        companyId: z.string().optional(),
        contactId: z.string().optional(),

        // 7. Responsabilidade
        ownerId: z.string().optional(),
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

      // Validate companyId if provided
      if (input.companyId) {
        const company = await db.company.findFirst({
          where: {
            id: input.companyId,
            tenantId: tenantId,
          },
        });

        if (!company) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Empresa não encontrada",
          });
        }
      }

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
            message: "Contato não encontrado",
          });
        }
      }

      // Determine stageId - use provided or get default
      let stageId = input.stageId;
      if (!stageId) {
        const defaultStage = await db.pipelineStage.findFirst({
          where: {
            tenantId: tenantId,
            isActive: true,
          },
          orderBy: { order: "asc" },
        });

        if (!defaultStage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Nenhum estágio de pipeline encontrado. Configure o pipeline primeiro.",
          });
        }

        stageId = defaultStage.id;
      } else {
        // Validate stageId belongs to tenant
        const stage = await db.pipelineStage.findFirst({
          where: {
            id: stageId,
            tenantId: tenantId,
          },
        });

        if (!stage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Estágio não encontrado ou não pertence ao seu tenant",
          });
        }
      }

      const stage = await db.pipelineStage.findUnique({
        where: { id: stageId },
        select: { probability: true },
      });

      const deal = await db.deal.create({
        data: {
          tenantId: tenantId,
          ownerId: input.ownerId || session.user.id,
          title: input.title,
          description: input.description || null,
          stageId: stageId,
          probability: input.probability ?? stage?.probability ?? 0,
          priority: input.priority,
          clientProblem: input.clientProblem || null,
          opportunityReason: input.opportunityReason || null,
          sourceChannel: input.sourceChannel || null,
          marketSegment: input.marketSegment || null,
          productSolution: input.productSolution || null,
          value: input.value,
          quantity: input.quantity || null,
          currency: input.currency,
          expectedClose: input.expectedClose || null,
          companyId: input.companyId || null,
          contactId: input.contactId || null,
        },
      });

      // Serialize Decimal for JSON response
      return {
        ...deal,
        value: deal.value.toString(),
        expectedClose: deal.expectedClose?.toISOString() ?? null,
        wonAt: deal.wonAt?.toISOString() ?? null,
      };
    }),

  // Atualizar deal
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // 1. Identificação do Negócio
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        stageId: z.string().optional(),
        priority: DealPriority.optional(),

        // 2. Contexto Comercial (dor e motivação)
        clientProblem: z.string().optional(),
        opportunityReason: z.string().optional(),
        sourceChannel: DealSourceChannelSchema.optional(),

        // 3. Qualificação de Mercado
        marketSegment: z.string().optional(),
        productSolution: z.string().optional(),

        // 4. Valor e Métrica
        value: z.number().min(0).optional(),
        quantity: z.number().int().min(0).optional(),
        currency: z.string().optional(),

        // 5. Previsão e Probabilidade
        expectedClose: z.date().optional(),
        probability: z.number().int().min(0).max(100).optional(),
        lostReason: z.string().optional(),

        // 6. Relacionamentos
        companyId: z.string().optional(),
        contactId: z.string().optional(),

        // 7. Responsabilidade
        ownerId: z.string().optional(),
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
        include: {
          stage: {
            select: { key: true },
          },
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

      // Validate stageId if provided
      if (input.stageId) {
        const stage = await db.pipelineStage.findFirst({
          where: {
            id: input.stageId,
            tenantId: tenantId,
          },
        });

        if (!stage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Estágio não encontrado ou não pertence ao seu tenant",
          });
        }
      }

      // Validate companyId if provided
      if (input.companyId) {
        const company = await db.company.findFirst({
          where: {
            id: input.companyId,
            tenantId: tenantId,
          },
        });

        if (!company) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Empresa não encontrada",
          });
        }
      }

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
            message: "Contato não encontrado",
          });
        }
      }

      const data: any = { ...input };
      delete data.id;

      // Atualizar probabilidade se mudou de estágio e não foi fornecida explicitamente
      if (input.stageId && input.probability === undefined) {
        const newStage = await db.pipelineStage.findUnique({
          where: { id: input.stageId },
          select: { probability: true, key: true },
        });
        data.probability = newStage?.probability ?? data.probability;

        // Se mudou para closed_won e não estava antes, setar wonAt
        if (newStage?.key === "closed_won" && existingDeal.stage?.key !== "closed_won") {
          data.wonAt = new Date();
        }
      }

      const updatedDeal = await db.deal.update({
        where: { id: input.id },
        data,
      });

      // Serialize Decimal for JSON response
      return {
        ...updatedDeal,
        value: updatedDeal.value.toString(),
        expectedClose: updatedDeal.expectedClose?.toISOString() ?? null,
        wonAt: updatedDeal.wonAt?.toISOString() ?? null,
      };
    }),

  // Atualizar stage do deal (para drag & drop no kanban)
  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        stageId: z.string(),
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
        include: {
          stage: {
            select: { key: true },
          },
        },
      });

      if (!existingDeal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deal não encontrado",
        });
      }

      // Validate stageId
      const stage = await db.pipelineStage.findFirst({
        where: {
          id: input.stageId,
          tenantId: tenantId,
        },
        select: {
          probability: true,
          key: true,
        },
      });

      if (!stage) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Estágio não encontrado",
        });
      }

      const data: any = { stageId: input.stageId, probability: stage.probability };

      if (stage.key === "closed_won" && existingDeal.stage?.key !== "closed_won") {
        data.wonAt = new Date();
      }

      const updatedDeal = await db.deal.update({
        where: { id: input.id },
        data,
      });

      // Serialize Decimal for JSON response
      return {
        ...updatedDeal,
        value: updatedDeal.value.toString(),
        expectedClose: updatedDeal.expectedClose?.toISOString() ?? null,
        wonAt: updatedDeal.wonAt?.toISOString() ?? null,
      };
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

    const [totalDeals, totalValue, byStage, bySourceChannel, wonThisMonth, lostThisMonth] = await Promise.all([
      db.deal.count({ where }),
      db.deal.aggregate({
        where,
        _sum: { value: true },
      }),
      // Agrupar por estágio
      db.deal.groupBy({
        by: ["stageId"],
        where,
        _count: true,
        _sum: { value: true },
      }),
      // Agrupar por canal de origem
      db.deal.groupBy({
        by: ["sourceChannel"],
        where: {
          ...where,
          sourceChannel: { not: null },
        },
        _count: true,
        _sum: { value: true },
      }),
      db.deal.count({
        where: {
          ...where,
          stage: {
            key: "closed_won",
          },
          wonAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      db.deal.count({
        where: {
          ...where,
          stage: {
            key: "closed_lost",
          },
          updatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Buscar informações dos estágios
    const stages = await db.pipelineStage.findMany({
      where: {
        id: { in: byStage.map((s) => s.stageId).filter(Boolean) as string[] },
      },
      select: {
        id: true,
        name: true,
        key: true,
        order: true,
        color: true,
      },
    });

    const stageMap = new Map(stages.map((s) => [s.id, s]));

    return {
      totalDeals,
      totalValue: totalValue._sum.value?.toNumber() || 0,
      byStage: byStage
        .filter((s) => s.stageId !== null)
        .map((s) => {
          const stage = stageMap.get(s.stageId!);
          return {
            stageId: s.stageId,
            stageName: stage?.name || "Unknown",
            stageKey: stage?.key || null,
            stageOrder: stage?.order || 0,
            stageColor: stage?.color || null,
            count: s._count,
            value: s._sum.value?.toNumber() || 0,
          };
        })
        .sort((a, b) => a.stageOrder - b.stageOrder),
      bySourceChannel: bySourceChannel
        .map((s) => ({
          sourceChannel: s.sourceChannel,
          count: s._count,
          value: s._sum.value?.toNumber() || 0,
        }))
        .sort((a, b) => b.value - a.value),
      wonThisMonth,
      lostThisMonth,
    };
  }),
});
