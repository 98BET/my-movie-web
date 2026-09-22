import { defineConfig } from "prisma/config";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_9QC0BcoYEkKS@ep-royal-poetry-axn84siq-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
