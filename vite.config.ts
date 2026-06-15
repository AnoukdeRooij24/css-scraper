import { defineConfig } from "vite";
import { dirname, resolve } from 'node:path'

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
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        nested: resolve(import.meta.dirname, 'scraper.html'),
      },
    },
  },
});
