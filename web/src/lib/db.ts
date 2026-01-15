import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPgPool: Pool | undefined;
};

function createPrismaClient() {
  const pool =
    globalForPrisma.prismaPgPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
    });

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
  });

  if (!globalForPrisma.prismaPgPool) {
    globalForPrisma.prismaPgPool = pool;
  }

  return client;
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
