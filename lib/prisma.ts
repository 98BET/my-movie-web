import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_9QC0BcoYEkKS@ep-royal-poetry-axn84siq-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

process.env.DATABASE_URL = DATABASE_URL;

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

const adapter = new PrismaNeon({ connectionString: DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
