import { defineConfig } from "vitest/config";

console.log("loaded");
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setup-vitest.ts"],
  },
});
