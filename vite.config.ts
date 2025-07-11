import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { componentTagger } from "lovable-tagger";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: ["react", "react-dom", "@reduxjs/toolkit", "react-redux"],
  },
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "pdfjs-dist": "pdfjs-dist/legacy/build/pdf",
      react: path.resolve(process.cwd(), "node_modules/react"),
      "react-dom": path.resolve(process.cwd(), "node_modules/react-dom"),
    },
  },
  build: {
    target: "es2015",
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          ui: ["framer-motion", "lucide-react"],
          pdf: ["pdfjs-dist", "mammoth"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: "all",
  },
}));
