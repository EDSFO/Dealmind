import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ensureUser } from "~/server/lib/user";

// Enums Zod schemas
const CompanyStatusSchema = z.enum(["LEAD", "PROSPECT", "CLIENT", "INACTIVE"]);
const BusinessTypeSchema = z.enum(["B2B", "B2C", "INDUSTRY", "RETAIL", "SERVICES", "TECHNOLOGY", "MANUFACTURING", "AGRO", "OTHER"]);
const CompanySizeSchema = z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE"]);
const CompanyPotentialSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
const LeadSourceSchema = z.enum(["INBOUND", "OUTBOUND", "REFERRAL", "EVENT", "PARTNERSHIP", "ADVERTISING", "CONTENT", "SOCIAL_MEDIA", "OTHER"]);

export const companyRouter = createTRPCRouter({
  // Listar empresas do tenant com filtros e paginação
  list: protectedProcedure
    .input(
      z.object({
        status: CompanyStatusSchema.optional(),
        businessType: BusinessTypeSchema.optional(),
        companySize: CompanySizeSchema.optional(),
        potential: CompanyPotentialSchema.optional(),
        leadSource: LeadSourceSchema.optional(),
        search: z.string().optional(), // Busca por nome ou CNPJ
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return [];
      }

      const user = await ensureUser(db, session);
      if (!user?.tenantId) return [];

      const where: any = { tenantId: user.tenantId };

      if (input?.status) where.status = input.status;
      if (input?.businessType) where.businessType = input.businessType;
      if (input?.companySize) where.companySize = input.companySize;
      if (input?.potential) where.potential = input.potential;
      if (input?.leadSource) where.leadSource = input.leadSource;
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { legalName: { contains: input.search, mode: "insensitive" } },
          { cnpj: { contains: input.search } },
        ];
      }

      return db.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { contacts: true, tickets: true },
          },
        },
      });
    }),

  // Buscar empresa por ID com todos os relacionamentos
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      if (!session?.user) {
        return null;
      }

      const user = await ensureUser(db, session);
      if (!user?.tenantId) return null;

      return db.company.findFirst({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          contacts: {
            select: { id: true, name: true, email: true, position: true },
          },
          tickets: {
            select: { id: true, title: true, status: true, priority: true },
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }),

  // Criar nova empresa
  create: protectedProcedure
    .input(
      z.object({
        // 1. Identificação
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        legalName: z.string().optional(),
        cnpj: z.string().optional(),
        status: CompanyStatusSchema.default("LEAD"),
        logoUrl: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),

        // 2. Classificação de Negócio
        segment: z.string().optional(),
        businessType: BusinessTypeSchema.optional(),
        companySize: CompanySizeSchema.optional(),
        employeeCount: z.number().int().min(0).optional(),
        annualRevenue: z.number().min(0).optional(),

        // 3. Localização
        country: z.string().default("Brasil"),
        state: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),

        // 4. Informações Comerciais
        potential: CompanyPotentialSchema.optional(),
        leadSource: LeadSourceSchema.optional(),
        productsOfInterest: z.string().optional(),
        estimatedValue: z.number().min(0).optional(),

        // 5. Responsabilidade
        ownerId: z.string().optional(),

        // 6. Observações Estratégicas
        description: z.string().optional(),
        internalNotes: z.string().optional(),
        perceivedRisks: z.string().optional(),
        mappedOpportunities: z.string().optional(),
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
          message: "Usuário não possui um tenant associado",
        });
      }

      // Verificar se CNPJ já está cadastrado
      if (input.cnpj) {
        const existing = await db.company.findUnique({
          where: { cnpj: input.cnpj },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "CNPJ já cadastrado",
          });
        }
      }

      return db.company.create({
        data: {
          tenantId: user.tenantId,
          name: input.name,
          legalName: input.legalName,
          cnpj: input.cnpj || null,
          status: input.status,
          logoUrl: input.logoUrl || null,
          website: input.website || null,
          segment: input.segment,
          businessType: input.businessType,
          companySize: input.companySize,
          employeeCount: input.employeeCount,
          annualRevenue: input.annualRevenue ? String(input.annualRevenue) : null,
          country: input.country,
          state: input.state,
          city: input.city,
          zipCode: input.zipCode,
          potential: input.potential,
          leadSource: input.leadSource,
          productsOfInterest: input.productsOfInterest,
          estimatedValue: input.estimatedValue ? String(input.estimatedValue) : null,
          ownerId: input.ownerId,
          description: input.description,
          internalNotes: input.internalNotes,
          perceivedRisks: input.perceivedRisks,
          mappedOpportunities: input.mappedOpportunities,
        },
      });
    }),

  // Atualizar empresa
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // 1. Identificação
        name: z.string().min(2).optional(),
        legalName: z.string().optional(),
        cnpj: z.string().optional(),
        status: CompanyStatusSchema.optional(),
        logoUrl: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),

        // 2. Classificação de Negócio
        segment: z.string().optional(),
        businessType: BusinessTypeSchema.optional(),
        companySize: CompanySizeSchema.optional(),
        employeeCount: z.number().int().min(0).optional(),
        annualRevenue: z.number().min(0).optional(),

        // 3. Localização
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),

        // 4. Informações Comerciais
        potential: CompanyPotentialSchema.optional(),
        leadSource: LeadSourceSchema.optional(),
        productsOfInterest: z.string().optional(),
        estimatedValue: z.number().min(0).optional(),

        // 5. Responsabilidade
        ownerId: z.string().optional(),

        // 6. Observações Estratégicas
        description: z.string().optional(),
        internalNotes: z.string().optional(),
        perceivedRisks: z.string().optional(),
        mappedOpportunities: z.string().optional(),
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

      // Se CNPJ está sendo alterado, verificar se já existe
      if (input.cnpj && input.cnpj !== company.cnpj) {
        const existing = await db.company.findUnique({
          where: { cnpj: input.cnpj },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "CNPJ já cadastrado",
          });
        }
      }

      // Construir objeto de atualização apenas com campos fornecidos
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.legalName !== undefined) updateData.legalName = input.legalName;
      if (input.cnpj !== undefined) updateData.cnpj = input.cnpj || null;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl || null;
      if (input.website !== undefined) updateData.website = input.website || null;
      if (input.segment !== undefined) updateData.segment = input.segment;
      if (input.businessType !== undefined) updateData.businessType = input.businessType;
      if (input.companySize !== undefined) updateData.companySize = input.companySize;
      if (input.employeeCount !== undefined) updateData.employeeCount = input.employeeCount;
      if (input.annualRevenue !== undefined) updateData.annualRevenue = input.annualRevenue ? String(input.annualRevenue) : null;
      if (input.country !== undefined) updateData.country = input.country;
      if (input.state !== undefined) updateData.state = input.state;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.zipCode !== undefined) updateData.zipCode = input.zipCode;
      if (input.potential !== undefined) updateData.potential = input.potential;
      if (input.leadSource !== undefined) updateData.leadSource = input.leadSource;
      if (input.productsOfInterest !== undefined) updateData.productsOfInterest = input.productsOfInterest;
      if (input.estimatedValue !== undefined) updateData.estimatedValue = input.estimatedValue ? String(input.estimatedValue) : null;
      if (input.ownerId !== undefined) updateData.ownerId = input.ownerId;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.internalNotes !== undefined) updateData.internalNotes = input.internalNotes;
      if (input.perceivedRisks !== undefined) updateData.perceivedRisks = input.perceivedRisks;
      if (input.mappedOpportunities !== undefined) updateData.mappedOpportunities = input.mappedOpportunities;

      return db.company.update({
        where: { id: input.id },
        data: updateData,
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

      const user = await ensureUser(db, session);

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
});
