/**
 * Database helper for Cloudflare Workers + Neon
 *
 * Usage inside a route:
 *   const prisma = await getPrisma(c.env.DATABASE_URL);
 */

import { PrismaClient } from "@prisma/client";

let nodePrisma: PrismaClient | null = null;

function isNodeRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    !!process.versions?.node &&
    typeof globalThis.navigator === "undefined" &&
    typeof globalThis.WorkerGlobalScope === "undefined"
  );
}

/**
 * Returns a Prisma client.
 * - In Workers: uses Neon serverless adapter when possible
 * - Falls back to standard client for local Node scripts and tooling
 */
export async function getPrisma(connectionString?: string): Promise<PrismaClient> {
  // Prefer the standard client only for true Node runtimes.
  // Cloudflare Workers expose a Node-like process object under nodejs_compat,
  // so we must guard on navigator to avoid the edge-runtime validation error.
  if (isNodeRuntime()) {
    if (!nodePrisma) {
      nodePrisma = new PrismaClient({
        datasources: connectionString
          ? { db: { url: connectionString } }
          : undefined,
        log: ["error"],
      });
    }
    return nodePrisma;
  }

  // Edge / Workers path with Neon adapter
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const { Pool, neonConfig } = await import("@neondatabase/serverless");

  if (typeof WebSocket !== "undefined") {
    neonConfig.webSocketConstructor = WebSocket;
  } else {
    try {
      const ws = await import("ws");
      neonConfig.webSocketConstructor = ws.default;
    } catch {
      // ws may not be needed in some runtimes
    }
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter, log: ["error"] });
}
