import { TRPCError } from "@trpc/server";
import { PrismaClient } from "../../generated/prisma";

/**
 * Ensures a user exists in the database.
 * If the user doesn't exist, creates them with a proper tenant association.
 *
 * This solves the issue where users exist in Auth but not in the database,
 * which was causing insert operations to fail.
 */
export async function ensureUser(db: PrismaClient, session: any) {
  if (!session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sessão inválida",
    });
  }

  // Try to find existing user
  let user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, tenantId: true },
  });

  // If user doesn't exist, create them with proper tenant
  if (!user) {
    // Create or get tenant for the user
    // Use a unique identifier based on the user's email domain
    const email = session.user.email || "unknown@example.com";
    const domain = email.split("@")[1] || "unknown";
    const tenantIdentifier = `tenant-${domain.replace(/\./g, "-")}`;

    const tenant = await db.tenant.upsert({
      where: { id: tenantIdentifier },
      create: {
        id: tenantIdentifier,
        name: domain,
      },
      update: {},
      select: { id: true },
    });

    // Create the user
    user = await db.user.create({
      data: {
        id: session.user.id,
        email: email,
        name: session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.name ||
              "User",
        tenantId: tenant.id,
        role: "ADMIN",
      },
      select: { id: true, email: true, name: true, role: true, tenantId: true },
    });

    console.log("User created:", user.id, "tenantId:", user.tenantId);
  }

  return user;
}
