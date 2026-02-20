import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

export const tenantRouter = createTRPCRouter({
    // Get current tenant details
    getDetails: protectedProcedure.query(async ({ ctx }) => {
        const { db, session } = ctx;

        if (!session?.user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Usuário não autenticado",
            });
        }

        const currentUser = await ensureUser(db, session);

        return db.tenant.findUnique({
            where: {
                id: currentUser.tenantId,
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        deals: true,
                        companies: true,
                        contacts: true,
                    }
                }
            }
        });
    }),

    // Update tenant details
    update: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;

            if (!session?.user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                });
            }

            const currentUser = await ensureUser(db, session);

            // Apenas ADMIN ou LIDER deveriam atualizar, mas por agora permitimos quem tem acesso
            if (currentUser.role !== "ADMIN" && currentUser.role !== "LIDER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Apenas administradores e líderes podem alterar os dados da empresa."
                });
            }

            return db.tenant.update({
                where: { id: currentUser.tenantId },
                data: {
                    name: input.name,
                },
            });
        }),
});
