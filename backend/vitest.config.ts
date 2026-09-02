import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Un setup que carga las variables de entorno reales (.env) antes de los imports
    setupFiles: ["./tests/setup.ts"],
    // Los tests unitarios no deben golpear la BD; los de integración sí (BD dev + limpieza)
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
  },
});
