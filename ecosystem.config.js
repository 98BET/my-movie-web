module.exports = {
  apps: [
    {
      name: "movie-web",
      script: "node_modules/next/dist/bin/next",
      args: "start --hostname 0.0.0.0",
      cwd: process.cwd(),
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
