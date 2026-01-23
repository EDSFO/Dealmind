import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

export const pipelineStageRouter = createTRPCRouter({
  // Listar todos os estágios do pipeline do tenant
  list: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().default(false),
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

      // Só inclui inativos se explicitamente solicitado
      if (!input?.includeInactive) {
        where.isActive = true;
      }

      return db.pipelineStage.findMany({
        where,
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { deals: true },
          },
        },
      });
    }),

  // Buscar estágio por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const user = await ensureUser(db, session);
      if (!user?.tenantId) return null;

      return db.pipelineStage.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
        include: {
          deals: {
            select: {
              id: true,
              title: true,
              value: true,
              owner: {
                select: { id: true, name: true },
              },
            },
            orderBy: { updatedAt: "desc" },
            take: 10,
          },
          _count: {
            select: { deals: true },
          },
        },
      });
    }),

  // Buscar estágio pela key (para lookup por código)
  byKey: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const user = await ensureUser(db, session);
      if (!user?.tenantId) return null;

      return db.pipelineStage.findFirst({
        where: {
          key: input.key,
          tenantId: user.tenantId,
        },
      });
    }),

  // Criar novo estágio no pipeline
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        key: z.string()
          .min(2, "Key deve ter pelo menos 2 caracteres")
          .regex(/^[a-z0-9_]+$/, "Key deve conter apenas letras minúsculas, números e underscores"),
        order: z.number().int().min(0).optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser em formato hexadecimal #RRGGBB").optional(),
        probability: z.number().int().min(0).max(100).optional(),
        isActive: z.boolean().default(true),
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

      // Verificar se key já existe para este tenant
      const existingByKey = await db.pipelineStage.findFirst({
        where: {
          tenantId: user.tenantId,
          key: input.key,
        },
      });

      if (existingByKey) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um estágio com esta key",
        });
      }

      // Se order não foi fornecido, colocar no final
      let order = input.order;
      if (order === undefined) {
        const maxOrder = await db.pipelineStage.findFirst({
          where: { tenantId: user.tenantId },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        order = (maxOrder?.order ?? -1) + 1;
      }

      // Verificar se order já está em uso
      const existingByOrder = await db.pipelineStage.findFirst({
        where: {
          tenantId: user.tenantId,
          order: order,
        },
      });

      if (existingByOrder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Já existe um estágio na posição ${order}. Reordene os estágios existentes primeiro.`,
        });
      }

      return db.pipelineStage.create({
        data: {
          tenantId: user.tenantId,
          name: input.name,
          key: input.key,
          order: order,
          color: input.color || null,
          probability: input.probability ?? null,
          isActive: input.isActive,
        },
      });
    }),

  // Atualizar estágio
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        key: z.string()
          .min(2)
          .regex(/^[a-z0-9_]+$/, "Key deve conter apenas letras minúsculas, números e underscores")
          .optional(),
        order: z.number().int().min(0).optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser em formato hexadecimal #RRGGBB").optional(),
        probability: z.number().int().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
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

      // Verificar se estágio existe e pertence ao tenant
      const existingStage = await db.pipelineStage.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
      });

      if (!existingStage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estágio não encontrado",
        });
      }

      // Se está mudando a key, verificar se já existe
      if (input.key && input.key !== existingStage.key) {
        const existingByKey = await db.pipelineStage.findFirst({
          where: {
            tenantId: user.tenantId,
            key: input.key,
            id: { not: input.id },
          },
        });

        if (existingByKey) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um estágio com esta key",
          });
        }
      }

      // Se está mudando a order, verificar se já existe
      if (input.order !== undefined && input.order !== existingStage.order) {
        const existingByOrder = await db.pipelineStage.findFirst({
          where: {
            tenantId: user.tenantId,
            order: input.order,
            id: { not: input.id },
          },
        });

        if (existingByOrder) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Já existe um estágio na posição ${input.order}. Use a função reorder para reordenar.`,
          });
        }
      }

      // Construir objeto de atualização apenas com campos fornecidos
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.key !== undefined) updateData.key = input.key;
      if (input.order !== undefined) updateData.order = input.order;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.probability !== undefined) updateData.probability = input.probability;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      return db.pipelineStage.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  // Reordenar estágios (atualiza orders de múltiplos estágios)
  reorder: protectedProcedure
    .input(
      z.object({
        stageOrders: z.array(
          z.object({
            id: z.string(),
            order: z.number().int().min(0),
          })
        ),
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

      // Validar que todos os IDs pertencem ao tenant
      const stages = await db.pipelineStage.findMany({
        where: {
          id: { in: input.stageOrders.map((s) => s.id) },
          tenantId: user.tenantId,
        },
      });

      if (stages.length !== input.stageOrders.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Um ou mais estágios não foram encontrados ou não pertencem ao tenant",
        });
      }

      // Verificar duplicação de orders
      const orders = input.stageOrders.map((s) => s.order);
      const uniqueOrders = new Set(orders);
      if (orders.length !== uniqueOrders.size) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Orders devem ser únicas",
        });
      }

      // Atualizar cada estágio
      const updates = input.stageOrders.map(({ id, order }) =>
        db.pipelineStage.update({
          where: { id },
          data: { order },
        })
      );

      await Promise.all(updates);

      return { success: true };
    }),

  // Deletar estágio
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
      force: z.boolean().default(false), // Se true, move deals para primeiro estágio ativo antes de deletar
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      const user = await ensureUser(db, session);

      // Verificar se estágio existe e pertence ao tenant
      const stage = await db.pipelineStage.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
        include: {
          _count: {
            select: { deals: true },
          },
        },
      });

      if (!stage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estágio não encontrado",
        });
      }

      // Verificar se há deals associados
      if (stage._count.deals > 0 && !input.force) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Não é possível deletar estágio com ${stage._count.deals} deals associados. Use force=true para mover os deals para o primeiro estágio.`,
        });
      }

      // Se force, mover deals para primeiro estágio ativo
      if (input.force && stage._count.deals > 0) {
        const firstStage = await db.pipelineStage.findFirst({
          where: {
            tenantId: user.tenantId,
            isActive: true,
            id: { not: input.id },
          },
          orderBy: { order: "asc" },
        });

        if (!firstStage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não há outro estágio ativo para mover os deals",
          });
        }

        // Mover todos os deals para o primeiro estágio
        await db.deal.updateMany({
          where: { stageId: input.id },
          data: { stageId: firstStage.id },
        });
      }

      return db.pipelineStage.delete({
        where: { id: input.id },
      });
    }),

  // Estatísticas do pipeline
  stats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    if (!session?.user) {
      return null;
    }

    const user = await ensureUser(db, session);
    if (!user?.tenantId) return null;

    const [
      totalStages,
      activeStages,
      stagesWithDeals,
      byStage,
    ] = await Promise.all([
      db.pipelineStage.count({
        where: { tenantId: user.tenantId },
      }),
      db.pipelineStage.count({
        where: { tenantId: user.tenantId, isActive: true },
      }),
      db.pipelineStage.count({
        where: {
          tenantId: user.tenantId,
          deals: { some: { stageId: { not: null } } },
        },
      }),
      db.pipelineStage.findMany({
        where: { tenantId: user.tenantId, isActive: true },
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { deals: true },
          },
          deals: {
            select: { value: true },
          },
        },
      }),
    ]);

    return {
      totalStages,
      activeStages,
      stagesWithDeals,
      byStage: byStage.map((stage) => ({
        id: stage.id,
        name: stage.name,
        key: stage.key,
        order: stage.order,
        color: stage.color,
        probability: stage.probability,
        dealCount: stage._count.deals,
        totalValue: stage.deals.reduce((sum, deal) => {
          const value = parseFloat(deal.value) || 0;
          return sum + value;
        }, 0),
      })),
    };
  }),

  // Inicializar pipeline com estágios padrão (se ainda não existirem)
  initializeDefault: protectedProcedure
    .mutation(async ({ ctx }) => {
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

      // Verificar se já existem estágios
      const existingCount = await db.pipelineStage.count({
        where: { tenantId: user.tenantId },
      });

      if (existingCount > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tenant já possui estágios configurados",
        });
      }

      const DEFAULT_STAGES = [
        { key: "lead", name: "Lead", order: 1, probability: 10, color: "#6B7280" },
        { key: "qualification", name: "Qualificação", order: 2, probability: 25, color: "#3B82F6" },
        { key: "proposal", name: "Proposta", order: 3, probability: 50, color: "#EAB308" },
        { key: "negotiation", name: "Negociação", order: 4, probability: 70, color: "#A855F7" },
        { key: "closed_won", name: "Ganho", order: 5, probability: 100, color: "#22C55E" },
        { key: "closed_lost", name: "Perdido", order: 6, probability: 0, color: "#EF4444" },
      ];

      const created = await db.pipelineStage.createMany({
        data: DEFAULT_STAGES.map((stage) => ({
          tenantId: user.tenantId,
          ...stage,
        })),
      });

      return {
        success: true,
        created: created.count,
        stages: DEFAULT_STAGES,
      };
    }),
});
