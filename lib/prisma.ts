import dns from "node:dns";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

function resolveIPv4(hostname: string) {
  try {
    const out = execSync(`getent ahostsv4 ${hostname}`, {
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const match = out.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/);
    if (match) {
      return match[1];
    }
  } catch {
    // Windows/dev or getent missing — fall back to hostname
  }
  return hostname;
}

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
    hostname: parsed.hostname,
    host: resolveIPv4(parsed.hostname),
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
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    ssl: {
      rejectUnauthorized: false,
      servername: cfg.hostname,
    },
  });

const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.pgPool = pool;
globalForPrisma.prisma = prisma;

export default prisma;
