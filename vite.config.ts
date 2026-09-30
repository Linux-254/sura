import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(root, "client/src"),
    },
  },
  envDir: root,
  root: path.resolve(root, "client"),
  publicDir: path.resolve(root, "client/public"),
  build: {
    outDir: path.resolve(root, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [".manus.computer", ".manuspre.computer", "localhost", "127.0.0.1"],
  },
});
