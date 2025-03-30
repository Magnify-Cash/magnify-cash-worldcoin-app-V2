
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // HMR configuration to ensure WebSocket connections work properly
      clientPort: 443, // Force the client to use HTTPS port for WebSocket
      overlay: true, // Show errors as an overlay
    },
    allowedHosts: ["6907-47-202-62-13.ngrok-free.app", "f467fed4-7ba0-4572-8b29-853708cc561f.lovableproject.com"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Fix the define configuration to properly handle environment variables
  define: {
    __WS_TOKEN__: JSON.stringify("lovable-dev-token"),
    // Ensure environment variables are properly stringified
    'process.env': {},
    'import.meta.env.VITE_WORLDCOIN_CLIENT_ID': JSON.stringify(process.env.VITE_WORLDCOIN_CLIENT_ID),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL),
    'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(process.env.VITE_ENVIRONMENT),
    'import.meta.env.VITE_MAGNIFY_WORLD_ADDRESS': JSON.stringify(process.env.VITE_MAGNIFY_WORLD_ADDRESS),
    'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN),
  }
}));
