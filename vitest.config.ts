import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Configuracion de Vitest: entorno jsdom, alias @ igual al de tsconfig y setup de testing-library
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
