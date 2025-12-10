import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({}),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "TUDBox",
        short_name: "tud-box",
        description: "A file storage application from TUD",
        theme_color: "#0c0c0c",
      },
      pwaAssets: { disabled: false, config: true },
      devOptions: { enabled: true },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: ["app.tud-box.test", "localhost", "tud-box.verdedata.ro"],
    // https: {
    //   key: "./.certs/app.tud-box.test+6-key.pem",
    //   cert: "./.certs/app.tud-box.test+6.pem",
    // },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
