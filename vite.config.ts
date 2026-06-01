import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; 
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(dep => !dep.includes('vendor-hls') && !dep.includes('vendor-dash'));
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('hls.js') || id.includes('hls-video-element')) {
              return 'vendor-hls';
            }
            if (id.includes('dashjs') || id.includes('dash-video-element')) {
              return 'vendor-dash';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
          }
        }
      }
    }
  }
});