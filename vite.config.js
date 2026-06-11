import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api/sikawan": {
        target: "https://sikawan-pagersari.id",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/sikawan/, "/wp-json/sikawan/v1"),
      },
    },
  },
});