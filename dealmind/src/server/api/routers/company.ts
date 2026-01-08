import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const companyRouter = createTRPCRouter({
  // Listar empresas do tenant
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    // Se não tem sessão, retorna lista vazia
    if (!session?.user) {
      return [];
    }

    // Buscar tenant do usuário
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    });

    // Se usuário não existe no banco, retorna lista vazia
    if (!user) {
      return [];
    }

    return db.company.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }),

  // Criar nova empresa
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
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

      // Buscar tenant do usuário
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado. Complete o cadastro primeiro.",
        });
      }

      return db.company.create({
        data: {
          name: input.name,
          tenantId: user.tenantId,
        },
      });
    }),

  // Atualizar empresa
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
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

      // Buscar tenant do usuário
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Verificar se empresa pertence ao tenant
      const company = await db.company.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Empresa não encontrada",
        });
      }

      return db.company.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  // Deletar empresa
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

      // Buscar tenant do usuário
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Verificar se empresa pertence ao tenant
      const company = await db.company.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Empresa não encontrada",
        });
      }

      return db.company.delete({
        where: { id: input.id },
      });
    }),

  // Buscar empresa por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true },
      });

      if (!user) {
        return null;
      }

      return db.company.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
      });
    }),
});
