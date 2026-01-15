import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

export const contactRouter = createTRPCRouter({
  // Listar contatos do tenant
  list: protectedProcedure
    .input(
      z.object({
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

      if (!currentUser.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não possui um tenant associado",
        });
      }

      const tenantId = currentUser.tenantId

      console.log('Fetching contacts for tenantId:', tenantId)

      const where: any = {
        tenantId: tenantId,
      };

      console.log('Where clause:', JSON.stringify(where))

      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { company: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const contacts = await db.contact.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { deals: true },
          },
        },
      })

      console.log('Found contacts:', contacts.length)
      return contacts
    }),

  // Buscar contato por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const currentUser = await ensureUser(db, session);
      if (!currentUser?.tenantId) return null;

      return db.contact.findFirst({
        where: {
          id: input.id,
          tenantId: currentUser.tenantId,
        },
        include: {
          deals: {
            orderBy: { updatedAt: "desc" },
          },
          conversations: {
            orderBy: { updatedAt: "desc" },
          },
        },
      });
    }),

  // Criar novo contato
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        company: z.string().optional().nullable(),
        position: z.string().optional().nullable(),
        source: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
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

      if (!currentUser.tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não possui um tenant associado.",
        });
      }

      console.log('Creating contact with tenantId:', currentUser.tenantId, 'data:', JSON.stringify(input))

      const contact = await db.contact.create({
        data: {
          tenantId: currentUser.tenantId,
          ...input,
        },
      })

      console.log('Contact created:', contact.id, contact.tenantId)
      return contact
    }),

  // Atualizar contato
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        company: z.string().optional().nullable(),
        position: z.string().optional().nullable(),
        source: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
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

      const existingContact = await db.contact.findFirst({
        where: {
          id: input.id,
          tenantId: currentUser.tenantId,
        },
      });

      if (!existingContact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contato não encontrado",
        });
      }

      const data: any = { ...input };
      delete data.id;

      return db.contact.update({
        where: { id: input.id },
        data,
      });
    }),

  // Excluir contato
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

      const existingContact = await db.contact.findFirst({
        where: {
          id: input.id,
          tenantId: currentUser.tenantId,
        },
      });

      if (!existingContact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contato não encontrado",
        });
      }

      return db.contact.delete({
        where: { id: input.id },
      });
    }),

  // Estatísticas de contatos
  stats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    if (!session?.user) {
      return null;
    }

    const currentUser = await ensureUser(db, session);
    if (!currentUser?.tenantId) return null;

    const [total, withEmail, withPhone, bySource] = await Promise.all([
      db.contact.count({ where: { tenantId: currentUser.tenantId } }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, email: { not: null } },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, phone: { not: null } },
      }),
      db.contact.groupBy({
        by: ["source"],
        where: { tenantId: currentUser.tenantId, source: { not: null } },
        _count: true,
      }),
    ]);

    return {
      total,
      withEmail,
      withPhone,
      bySource: bySource.map((s) => ({
        source: s.source,
        count: s._count,
      })),
    };
  }),
});
