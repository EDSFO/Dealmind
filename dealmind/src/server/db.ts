import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () => {
  // Limit connections to avoid pool exhaustion
  const connectionLimit = parseInt(process.env.DATABASE_CONNECTIONS || "3");

  return new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Configure connection pool
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Limit Prisma's connection pool
    __internal: {
      engine: {
        // @ts-expect-error - internal option
        forceAutoRollback: false,
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
