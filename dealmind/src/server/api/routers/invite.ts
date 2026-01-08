import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { randomBytes } from "crypto";
import { db } from "~/server/db";

export const inviteRouter = createTRPCRouter({
  // Criar convite e gerar link
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        role: z.enum(["VENDEDOR", "LIDER", "ADMIN"]),
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

      // Verificar se é admin
      const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, tenantId: true },
      });

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar convites",
        });
      }

      // Gerar token único
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Criar convite no banco
      const invite = await db.invite.create({
        data: {
          email: input.email,
          role: input.role,
          tenantId: currentUser.tenantId,
          token,
          expiresAt,
          createdById: session.user.id,
        },
      });

      // Gerar link de convite
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?invite=${token}`;

      return {
        inviteId: invite.id,
        email: input.email,
        role: input.role,
        inviteLink,
        expiresAt: expiresAt.toISOString(),
      };
    }),

  // Validar token de convite
  validate: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const invite = await db.invite.findUnique({
        where: { token: input.token },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          expiresAt: true,
          usedAt: true,
        },
      });

      if (!invite) {
        return { valid: false, error: "Convite não encontrado" };
      }

      if (invite.usedAt) {
        return { valid: false, error: "Este convite já foi utilizado" };
      }

      if (new Date() > invite.expiresAt) {
        return { valid: false, error: "Este convite expirou" };
      }

      return {
        valid: true,
        email: invite.email,
        role: invite.role,
        tenantId: invite.tenantId,
      };
    }),

  // Usar convite (marcar como usado)
  use: protectedProcedure
    .input(z.object({ token: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const invite = await db.invite.findUnique({
        where: { token: input.token },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Convite não encontrado",
        });
      }

      if (invite.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este convite já foi utilizado",
        });
      }

      if (new Date() > invite.expiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este convite expirou",
        });
      }

      // Marcar convite como usado e atualizar usuário
      await db.$transaction([
        db.invite.update({
          where: { id: invite.id },
          data: { usedAt: new Date() },
        }),
        db.user.update({
          where: { id: input.userId },
          data: {
            tenantId: invite.tenantId,
            role: invite.role,
          },
        }),
      ]);

      return { success: true };
    }),

  // Listar convites pendentes
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    if (!session?.user) {
      return [];
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return [];
    }

    return db.invite.findMany({
      where: {
        tenantId: currentUser.tenantId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }),

  // Cancelar convite
  cancel: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
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
          message: "Apenas administradores podem cancelar convites",
        });
      }

      // Verificar se convite existe e pertence ao tenant
      const invite = await db.invite.findFirst({
        where: {
          id: input.inviteId,
          tenantId: currentUser.tenantId,
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Convite não encontrado",
        });
      }

      return db.invite.delete({
        where: { id: input.inviteId },
      });
    }),
});
