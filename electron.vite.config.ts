// electron.vite.config.ts
import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  main: {
    build: {
      outDir: "dist/main",
      lib: {
        entry: resolve(__dirname, "src/main/main.ts"),
        formats: ["cjs"],
      },
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  preload: {
    build: {
      outDir: "dist/preload",
      lib: {
        entry: resolve(__dirname, "src/preload/preload.ts"),
        formats: ["cjs"],
      },
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "src/renderer"),
    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: resolve(__dirname, "src/renderer/index.html"),
      },
    },
    plugins: [vue()],
    server: {
      port: 5173,
      strictPort: true,
    },
  },
});
