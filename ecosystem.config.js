/**
 * PM2 Process Manager Configuration for ASMARATY Luxury Yachts
 * Target: Hostinger Linux KVM VPS (Ubuntu 22.04 / 24.04 LTS)
 */

module.exports = {
  apps: [
    {
      name: "asmaraty-yachts",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/yatch",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
