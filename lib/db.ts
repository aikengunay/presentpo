import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is required (PostgreSQL). See .env.example and docs/deploy-presentpo.md",
    );
  }
  if (url.startsWith("file:")) {
    throw new Error(
      "SQLite file: URLs are no longer supported. Use PostgreSQL DATABASE_URL.",
    );
  }
  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function createPrismaClient() {
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: databaseUrl(),
    });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // After schema changes, a hot-reloaded process can keep a stale client
  // without new delegates (e.g. checkInToken). Recreate in that case.
  const delegate = (
    existing as { checkInToken?: { deleteMany?: unknown } } | undefined
  )?.checkInToken;
  if (existing && typeof delegate?.deleteMany === "function") {
    return existing;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrisma();
