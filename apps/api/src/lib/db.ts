/**
 * Database helper for Cloudflare Workers + Neon
 *
 * Usage inside a route:
 *   const prisma = await getPrisma(c.env.DATABASE_URL);
 */

import { PrismaClient } from "@prisma/client";

/**
 * Returns a Prisma client.
 * - In Workers: uses Neon serverless adapter when possible
 * - Falls back to standard client (works with wrangler dev + nodejs_compat)
 */
export async function getPrisma(connectionString?: string): Promise<PrismaClient> {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter, log: ["error"] });
}
