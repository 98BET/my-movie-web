import dns from "node:dns";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    parsed.searchParams.set("sslmode", "require");
    return parsed.toString();
  } catch {
    return url;
  }
}

function lookupIPv4(
  hostname: string,
  options: dns.LookupOneOptions,
  callback: Parameters<typeof dns.lookup>[2],
) {
  dns.lookup(hostname, { ...options, family: 4, all: false }, callback);
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: connectionString(),
    max: 2,
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    ssl: { rejectUnauthorized: false },
    lookup: lookupIPv4,
  });

const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.pgPool = pool;
globalForPrisma.prisma = prisma;

export default prisma;
