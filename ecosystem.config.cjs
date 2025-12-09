"use strict";
module.exports = {
  apps: [
    {
      name: "bettertins-api",
      script: "apps/server/dist/index.js",
      interpreter: "bun",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "bettertins-web",
      // Use 'serve' to serve the static build.
      // Ensure 'serve' is installed globally: bun install -g serve
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./apps/web/dist",
        PM2_SERVE_PORT: 3001,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html",
      },
    },
  ],
};
