import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

// Novo enum com status atualizados
const ContactStatusSchema = z.enum(["LEAD", "QUALIFIED", "CLIENT", "INACTIVE"]);

// Enum para origem do contato
const ContactSourceSchema = z.enum([
  "INBOUND",
  "OUTBOUND",
  "REFERRAL",
  "EVENT",
  "PARTNERSHIP",
  "ADVERTISING",
  "CONTENT",
  "SOCIAL_MEDIA",
  "WEBSITE",
  "WHATSAPP",
  "EMAIL",
  "OTHER",
]);

export const contactRouter = createTRPCRouter({
  // Listar contatos do tenant com filtros
  list: protectedProcedure
    .input(
      z.object({
        status: ContactStatusSchema.optional(),
        source: ContactSourceSchema.optional(),
        search: z.string().optional(),
        companyId: z.string().optional(),
        ownerId: z.string().optional(),
        includeDeals: z.boolean().default(false),
        includeTickets: z.boolean().default(false),
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

      const where: any = {
        tenantId: currentUser.tenantId,
      };

      if (input?.status) where.status = input.status;
      if (input?.source) where.source = input.source;
      if (input?.companyId) where.companyId = input.companyId;
      if (input?.ownerId) where.ownerId = input.ownerId;

      if (input?.search) {
        where.OR = [
          { firstName: { contains: input.search, mode: "insensitive" } },
          { lastName: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { landline: { contains: input.search } },
          { mobilePhone: { contains: input.search } },
          { whatsapp: { contains: input.search } },
          { company: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return db.contact.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          companyRel: {
            select: { id: true, name: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
          ...(input?.includeDeals && {
            deals: {
              select: { id: true, title: true, stageId: true, value: true },
              take: 5,
            },
          }),
          ...(input?.includeTickets && {
            tickets: {
              select: { id: true, title: true, status: true, priority: true },
              take: 5,
            },
          }),
          _count: {
            select: { deals: true, tickets: true },
          },
        },
      });
    }),

  // Buscar contato por ID com relacionamentos
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
          companyRel: {
            select: { id: true, name: true },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
          deals: {
            select: { id: true, title: true, value: true, stageId: true },
            orderBy: { updatedAt: "desc" },
          },
          conversations: {
            select: { id: true, subject: true, processingStatus: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          tickets: {
            select: { id: true, title: true, status: true, priority: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });
    }),

  // Criar novo contato
  create: protectedProcedure
    .input(
      z.object({
        // 1. Identificação Básica
        firstName: z.string().min(1, "Nome é obrigatório"),
        lastName: z.string().optional(),
        email: z.string().email().optional().nullable(),
        landline: z.string().optional(),
        mobilePhone: z.string().optional(),
        whatsapp: z.string().optional(),

        // 2. Informações Profissionais
        position: z.string().optional(),
        department: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal("")),
        company: z.string().optional().nullable(),
        companyId: z.string().optional().nullable(),

        // 3. Relacionamento Comercial
        ownerId: z.string().optional(),
        status: ContactStatusSchema.default("LEAD"),
        source: ContactSourceSchema.optional(),

        // 4. Classificação
        leadScore: z.number().int().min(0).max(100).optional().default(0),

        // 5. Contexto e Observações
        internalNotes: z.string().optional(),
        relationshipNotes: z.string().optional(),
        preferences: z.string().optional(),

        // 6. Informações Adicionais
        tags: z.array(z.string()).optional(),
        metadata: z.any().optional(),
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

      // Verificar se email já existe no tenant
      if (input.email) {
        const existing = await db.contact.findFirst({
          where: {
            tenantId: currentUser.tenantId,
            email: input.email,
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um contato com este email",
          });
        }
      }

      return db.contact.create({
        data: {
          tenantId: currentUser.tenantId,
          firstName: input.firstName,
          lastName: input.lastName || null,
          email: input.email || null,
          landline: input.landline || null,
          mobilePhone: input.mobilePhone || null,
          whatsapp: input.whatsapp || null,
          position: input.position || null,
          department: input.department || null,
          linkedinUrl: input.linkedinUrl || null,
          company: input.company || null,
          companyId: input.companyId || null,
          ownerId: input.ownerId || null,
          status: input.status,
          source: input.source || null,
          leadScore: input.leadScore || 0,
          internalNotes: input.internalNotes || null,
          relationshipNotes: input.relationshipNotes || null,
          preferences: input.preferences || null,
          tags: input.tags || [],
          metadata: input.metadata || null,
        },
      });
    }),

  // Atualizar contato
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // 1. Identificação Básica
        firstName: z.string().min(1).optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional().nullable(),
        landline: z.string().optional(),
        mobilePhone: z.string().optional(),
        whatsapp: z.string().optional(),

        // 2. Informações Profissionais
        position: z.string().optional(),
        department: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal("")),
        company: z.string().optional().nullable(),
        companyId: z.string().optional().nullable(),

        // 3. Relacionamento Comercial
        ownerId: z.string().optional(),
        status: ContactStatusSchema.optional(),
        source: ContactSourceSchema.optional(),

        // 4. Classificação
        leadScore: z.number().int().min(0).max(100).optional(),

        // 5. Contexto e Observações
        internalNotes: z.string().optional(),
        relationshipNotes: z.string().optional(),
        preferences: z.string().optional(),

        // 6. Informações Adicionais
        tags: z.array(z.string()).optional(),
        metadata: z.any().optional(),
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

      // Verificar se contato existe e pertence ao tenant
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

      // Se email está sendo alterado, verificar se já existe
      if (input.email && input.email !== existingContact.email) {
        const existing = await db.contact.findFirst({
          where: {
            tenantId: currentUser.tenantId,
            email: input.email,
            id: { not: input.id },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um contato com este email",
          });
        }
      }

      // Construir objeto de atualização apenas com campos fornecidos
      const updateData: any = {};
      if (input.firstName !== undefined) updateData.firstName = input.firstName;
      if (input.lastName !== undefined) updateData.lastName = input.lastName || null;
      if (input.email !== undefined) updateData.email = input.email || null;
      if (input.landline !== undefined) updateData.landline = input.landline || null;
      if (input.mobilePhone !== undefined) updateData.mobilePhone = input.mobilePhone || null;
      if (input.whatsapp !== undefined) updateData.whatsapp = input.whatsapp || null;
      if (input.position !== undefined) updateData.position = input.position || null;
      if (input.department !== undefined) updateData.department = input.department || null;
      if (input.linkedinUrl !== undefined) updateData.linkedinUrl = input.linkedinUrl || null;
      if (input.company !== undefined) updateData.company = input.company || null;
      if (input.companyId !== undefined) updateData.companyId = input.companyId || null;
      if (input.ownerId !== undefined) updateData.ownerId = input.ownerId || null;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.source !== undefined) updateData.source = input.source || null;
      if (input.leadScore !== undefined) updateData.leadScore = input.leadScore;
      if (input.internalNotes !== undefined) updateData.internalNotes = input.internalNotes || null;
      if (input.relationshipNotes !== undefined) updateData.relationshipNotes = input.relationshipNotes || null;
      if (input.preferences !== undefined) updateData.preferences = input.preferences || null;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.metadata !== undefined) updateData.metadata = input.metadata;

      return db.contact.update({
        where: { id: input.id },
        data: updateData,
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
    if (!currentUser.tenantId) return null;

    const [
      total,
      leads,
      qualified,
      clients,
      inactive,
      withEmail,
      withLandline,
      withMobilePhone,
      withWhatsapp,
      withCompany,
      byStatus,
      bySource,
    ] = await Promise.all([
      db.contact.count({ where: { tenantId: currentUser.tenantId } }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, status: "LEAD" },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, status: "QUALIFIED" },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, status: "CLIENT" },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, status: "INACTIVE" },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, email: { not: null } },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, landline: { not: null } },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, mobilePhone: { not: null } },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, whatsapp: { not: null } },
      }),
      db.contact.count({
        where: { tenantId: currentUser.tenantId, companyId: { not: null } },
      }),
      db.contact.groupBy({
        by: ["status"],
        where: { tenantId: currentUser.tenantId },
        _count: true,
      }),
      db.contact.groupBy({
        by: ["source"],
        where: {
          tenantId: currentUser.tenantId,
          source: { not: null },
        },
        _count: true,
      }),
    ]);

    return {
      total,
      leads,
      qualified,
      clients,
      inactive,
      withEmail,
      withLandline,
      withMobilePhone,
      withWhatsapp,
      withCompany,
      byStatus: byStatus.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
      bySource: bySource.reduce((acc, s) => {
        acc[s.source || "unknown"] = s._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }),
});
