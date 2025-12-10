"use strict";
module.exports = {
  name: "tudbox-api",
  script: "apps/server/dist/index.js",
  interpreter: "bun",
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
    NODE_ENV: "production",
    PORT: 3100,
  },
};
