import dns from "node:dns";
import net from "node:net";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

function databaseConfig() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const parsed = new URL(url);
  const database = decodeURIComponent(
    parsed.pathname.replace(/^\//, "").split("/")[0] || "neondb",
  );

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  };
}

const cfg = databaseConfig();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    max: 2,
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    ssl: { rejectUnauthorized: false },
    stream: () =>
      net.connect({
        host: cfg.host,
        port: cfg.port,
        family: 4,
      }),
  });

const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.pgPool = pool;
globalForPrisma.prisma = prisma;

export default prisma;
