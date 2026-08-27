import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (!env.VITE_API_URL?.trim()) {
    throw new Error("VITE_API_URL must be defined for the frontend build");
  }

  return {
    plugins: [react()],
  };
});
