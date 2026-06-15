import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "^/scraper/.*": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/scraper/, ""),
      },
    },
  },
});
