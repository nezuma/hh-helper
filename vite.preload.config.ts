// vite.preload.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist/preload",
    lib: {
      entry: resolve(__dirname, "src/preload/preload.ts"),
      formats: ["cjs"],
      fileName: () => "preload.js",
    },
    rollupOptions: {
      external: ["electron"],
      output: {
        format: "cjs",
      },
    },
    emptyOutDir: false,
    minify: false,
  },
});
