import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuration Vite avec JSX automatique
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],
});
