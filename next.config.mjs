const extraOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().replace(/^https?:\/\//, ""))
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.56.1:3000", "localhost:3000"],
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  serverActions: {
    allowedOrigins: [
      "localhost:3000",
      "14kmovie.com",
      "www.14kmovie.com",
      ...extraOrigins,
    ],
  },
};

export default nextConfig;
