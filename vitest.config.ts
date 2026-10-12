import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@content": path.resolve(import.meta.dirname, "content"),
      "@data": path.resolve(import.meta.dirname, "data"),
    },
  },
  test: { include: ["tests/**/*.test.ts"] },
});
