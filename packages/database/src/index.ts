import { PrismaClient } from "@prisma/client";

/**
 * Prisma client setup
 *
 * - Local / Node scripts: standard PrismaClient
 * - Cloudflare Workers: use createPrismaClient(connectionString) with Neon adapter
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isNodeRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    !!process.versions?.node &&
    typeof globalThis.navigator === "undefined" &&
    typeof globalThis.WorkerGlobalScope === "undefined"
  );
}

/** Standard client for Node.js environments (scripts, local tools) */
export const prisma =
  globalForPrisma.prisma ??
  (isNodeRuntime()
    ? new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      })
    : (() => {
        throw new Error(
          "Prisma edge runtime requires createPrismaClient(connectionString)"
        );
      })());

if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

/**
 * Create a Prisma client for Cloudflare Workers using Neon serverless driver.
 * Call this inside each request handler with the DATABASE_URL from env/bindings.
 */
export async function createPrismaClient(connectionString: string) {
  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const { Pool, neonConfig } = await import("@neondatabase/serverless");

  if (typeof WebSocket !== "undefined") {
    neonConfig.webSocketConstructor = WebSocket;
  } else {
    neonConfig.webSocketConstructor = (await import("ws")).default;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

export * from "@prisma/client";
export default prisma;
