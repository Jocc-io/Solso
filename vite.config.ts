import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// ---- fix __dirname in ESM ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --------------------------------

const isProd = process.env.NODE_ENV === "production";
const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(!isProd && isReplit
      ? [
          (await import("@replit/vite-plugin-cartographer")).cartographer(),
          (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        ]
      : []),
  ],

  // ---- fix process in browser ----
  define: {
  process: {
    env: {},
  },
},

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  root: path.resolve(__dirname, "client"),

  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
