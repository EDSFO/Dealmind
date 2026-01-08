import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Enum para roles - deve bater com o schema.prisma
const UserRole = z.enum(["VENDEDOR", "LIDER", "ADMIN"]);

export const userRouter = createTRPCRouter({
  // Listar usuários do tenant
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    if (!session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    // Verificar se é admin
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

    // Apenas ADMIN pode listar usuários
    if (currentUser.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem gerenciar usuários",
      });
    }

    return db.user.findMany({
      where: { tenantId: currentUser.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  // Buscar usuário por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, tenantId: true },
      });

      if (!currentUser) {
        return null;
      }

      // Apenas ADMIN pode ver detalhes de qualquer usuário
      if (currentUser.role !== "ADMIN") {
        return null;
      }

      return db.user.findFirst({
        where: {
          id: input.id,
          tenantId: currentUser.tenantId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  // Atualizar role de usuário
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: UserRole,
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

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem alterar roles",
        });
      }

      // Não permitir alterar próprio role
      if (input.userId === session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode alterar seu próprio papel",
        });
      }

      // Verificar se usuário alvo existe e pertence ao tenant
      const targetUser = await db.user.findFirst({
        where: {
          id: input.userId,
          tenantId: currentUser.tenantId,
        },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      return db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),

  // Remover usuário (soft delete - inativa)
  deactivate: protectedProcedure
    .input(z.object({ userId: z.string() }))
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

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem remover usuários",
        });
      }

      // Não permitir remover próprio usuário
      if (input.userId === session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode remover sua própria conta",
        });
      }

      // Verificar se usuário alvo existe e pertence ao tenant
      const targetUser = await db.user.findFirst({
        where: {
          id: input.userId,
          tenantId: currentUser.tenantId,
        },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      return db.user.update({
        where: { id: input.userId },
        data: { deletedAt: new Date() },
      });
    }),

  // Obter estatísticas do tenant (para dashboard admin)
  stats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    if (!session?.user) {
      return null;
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return null;
    }

    const [total, vendedors, lideres, adms] = await Promise.all([
      db.user.count({ where: { tenantId: currentUser.tenantId } }),
      db.user.count({ where: { tenantId: currentUser.tenantId, role: "VENDEDOR" } }),
      db.user.count({ where: { tenantId: currentUser.tenantId, role: "LIDER" } }),
      db.user.count({ where: { tenantId: currentUser.tenantId, role: "ADMIN" } }),
    ]);

    return {
      total,
      vendedors,
      lideres,
      adms,
    };
  }),
});
