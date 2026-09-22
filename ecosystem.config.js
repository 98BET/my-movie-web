module.exports = {
  apps: [
    {
      name: "movie-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/root/my-movie-web",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        NODE_OPTIONS: "--max-old-space-size=512",
        DATABASE_URL:
          "postgresql://neondb_owner:npg_9QC0BcoYEkKS@ep-royal-poetry-axn84siq-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
      },
    },
  ],
};
