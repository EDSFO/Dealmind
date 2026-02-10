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
      orderBy: { id: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
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
          companyId: true,
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

  // Obter análise de performance do usuário (Dashboard Analytics)
  getAnalytics: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        timeRange: z.enum(["7days", "month", "3months"]).default("7days"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const targetUserId = input.userId || session.user.id;

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      if (input.timeRange === "7days") startDate.setDate(now.getDate() - 7);
      if (input.timeRange === "month") startDate.setMonth(now.getMonth() - 1);
      if (input.timeRange === "3months") startDate.setMonth(now.getMonth() - 3);

      // Fetch Data
      const [conversations, activities, deals] = await Promise.all([
        // Conversations with Insights
        db.conversation.findMany({
          where: {
            userId: targetUserId,
            createdAt: { gte: startDate },
          },
          include: {
            insight: true,
          },
        }),
        // Activities
        db.activity.findMany({
          where: {
            userId: targetUserId,
            createdAt: { gte: startDate },
            type: "MEETING",
          },
        }),
        // Won Deals (for Success Prediction)
        db.deal.findMany({
          where: {
            ownerId: targetUserId,
            wonAt: { gte: startDate },
          },
          select: { value: true },
        }),
      ]);

      // --- CALCULATE METRICS ---

      // 1. Meetings Count & Duration
      const meetingsCount = conversations.length + activities.length;

      // Heuristic: 30 mins per activity, or estimate from conversation text length if available
      // Real implementation would use start/end times if available in schema
      const estDurationMinutes = (conversations.length * 45) + (activities.length * 30);
      const durationHours = Math.floor(estDurationMinutes / 60);
      const durationMinsRemainder = estDurationMinutes % 60;
      const durationStr = durationHours > 0 ? `${durationHours}h ${durationMinsRemainder}m` : `${durationMinsRemainder}m`;

      // 2. Performance Score (0-10)
      // Base score 5
      // +1 per won deal
      // +0.5 per conversation processed
      // -1 per risk signal (if we parsed them)
      let performanceScore = 5;

      if (deals.length > 0) performanceScore += (deals.length * 1);
      if (conversations.length > 0) performanceScore += (conversations.length * 0.5);

      // Check insights for signals
      let totalRiskSignals = 0;
      let totalProgressSignals = 0;

      conversations.forEach(c => {
        if (c.insight) {
          // Safely check if signals exist and are arrays/objects
          // @ts-ignore - Json type handling
          if (c.insight.riskSignals && Array.isArray(c.insight.riskSignals)) {
            // @ts-ignore
            totalRiskSignals += c.insight.riskSignals.length;
          }
          // @ts-ignore
          if (c.insight.progressSignals && Array.isArray(c.insight.progressSignals)) {
            // @ts-ignore
            totalProgressSignals += c.insight.progressSignals.length;
          }
        }
      });

      performanceScore += (totalProgressSignals * 0.5);
      performanceScore -= (totalRiskSignals * 0.5);

      // Clamp 0-10
      performanceScore = Math.max(0, Math.min(10, Math.round(performanceScore)));


      // 3. Success Prediction (1-5)
      // Heuristic based on activity volume + deals
      let successScore = 3; // Neutral start
      if (meetingsCount > 5) successScore += 1;
      if (deals.length > 0) successScore += 1;
      if (totalRiskSignals > totalProgressSignals) successScore -= 1;
      successScore = Math.max(1, Math.min(5, successScore));


      // 4. Customer Mood (1-5)
      // Infer from Sentiment or Risk/Progress ratio
      let moodScore = 3.5;
      if (totalProgressSignals > 0) moodScore += 1;
      if (totalRiskSignals > 0) moodScore -= 1;

      // 5. Chart Data (Simulation for "Real" feel over time)
      // Group meetings by day for the chart
      const chartDataMap = new Map<string, number>();

      // Initialize empty days
      const daysToGen = input.timeRange === '7days' ? 7 : input.timeRange === 'month' ? 30 : 12; // 12 weeks for 3 months? keep simple for now

      for (let i = 0; i < daysToGen; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Feb 10"
        chartDataMap.set(key, 0); // Default 0
      }

      // Populate with data
      [...conversations, ...activities].forEach(item => {
        const date = item.createdAt;
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (chartDataMap.has(key)) {
          chartDataMap.set(key, (chartDataMap.get(key) || 0) + 1);
        }
      });

      // Convert to array and reverse (oldest to newest)
      const chartData = Array.from(chartDataMap.entries())
        .map(([date, value]) => ({ date, value }))
        .reverse();


      return {
        metrics: {
          performance: performanceScore,
          successPrediction: successScore,
          customerMood: Number(moodScore.toFixed(1)), // 1 decimal
        },
        stats: {
          meetings: meetingsCount,
          duration: durationStr,
          delay: "0s", // Placeholder - need "scheduled vs actual" data
          spokenTime: "N/A", // Placeholder - need diarization
        },
        chartData
      };
    }),
});
