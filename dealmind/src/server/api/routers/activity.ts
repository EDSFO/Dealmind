import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

const TaskStatus = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export const activityRouter = createTRPCRouter({
  // Listar atividades do tenant
  list: protectedProcedure
    .input(
      z.object({
        dealId: z.string().optional(),
        userId: z.string().optional(),
        status: TaskStatus.optional(),
        type: z.string().optional(),
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

      if (input?.userId) {
        where.userId = input.userId;
      }

      if (input?.status) {
        where.status = input.status;
      }

      if (input?.type) {
        where.type = input.type;
      }

      return db.activity.findMany({
        where,
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          deal: {
            select: {
              id: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Buscar atividade por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const currentUser = await ensureUser(db, session);

      return db.activity.findFirst({
        where: {
          id: input.id,
          tenantId: currentUser.tenantId,
        },
        include: {
          deal: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // Criar nova atividade
  create: protectedProcedure
    .input(
      z.object({
        dealId: z.string().optional(),
        type: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        status: TaskStatus.default("PENDING"),
        dueAt: z.date().optional(),
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

      // Validate dealId if provided
      if (input.dealId) {
        const deal = await db.deal.findFirst({
          where: {
            id: input.dealId,
            tenantId: tenantId,
          },
        });

        if (!deal) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Deal não encontrado ou não pertence ao seu tenant",
          });
        }
      }

      return db.activity.create({
        data: {
          tenantId: tenantId,
          userId: session.user.id,
          dealId: input.dealId,
          type: input.type,
          title: input.title,
          description: input.description,
          status: input.status,
          dueAt: input.dueAt,
        },
      });
    }),

  // Atualizar atividade
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: TaskStatus.optional(),
        dueAt: z.date().nullable().optional(),
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

      const existingActivity = await db.activity.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!existingActivity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Atividade não encontrada",
        });
      }

      const data: any = { ...input };
      delete data.id;

      // Se status changed to COMPLETED, set completedAt
      if (input.status === "COMPLETED" && existingActivity.status !== "COMPLETED") {
        data.completedAt = new Date();
      }

      return db.activity.update({
        where: { id: input.id },
        data,
      });
    }),

  // Completar atividade
  complete: protectedProcedure
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

      const existingActivity = await db.activity.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!existingActivity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Atividade não encontrada",
        });
      }

      return db.activity.update({
        where: { id: input.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }),

  // Excluir atividade
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

      const existingActivity = await db.activity.findFirst({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      if (!existingActivity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Atividade não encontrada",
        });
      }

      return db.activity.delete({
        where: { id: input.id },
      });
    }),

  // Estatísticas de atividades
  stats: protectedProcedure
    .input(z.object({ dealId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const currentUser = await ensureUser(db, session);
      const where: any = { tenantId: currentUser.tenantId };
      if (input?.dealId) {
        where.dealId = input.dealId;
      }

      const [pending, inProgress, completed, overdue] = await Promise.all([
        db.activity.count({ where: { ...where, status: "PENDING" } }),
        db.activity.count({ where: { ...where, status: "IN_PROGRESS" } }),
        db.activity.count({ where: { ...where, status: "COMPLETED" } }),
        db.activity.count({
          where: {
            ...where,
            status: { not: "COMPLETED" },
            dueAt: { lt: new Date() },
          },
        }),
      ]);

      return {
        pending,
        inProgress,
        completed,
        overdue,
        total: pending + inProgress + completed,
      };
    }),
});
