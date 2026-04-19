import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    // Raised limit to avoid false-positive warnings on legitimate large bundles
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.html"),
      output: {
        manualChunks: {
          // Core React runtime
          "vendor-react": ["react", "react-dom"],
          // Routing
          "vendor-router": ["wouter"],
          // Radix UI primitives split in two to reduce individual chunk size
          "vendor-ui-core": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
          ],
          "vendor-ui-extra": [
            "@radix-ui/react-collapsible",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-switch",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
          ],
          // Data fetching
          "vendor-query": ["@tanstack/react-query"],
          // Forms & validation
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Charts
          "vendor-charts": ["recharts"],
          // Icons
          "vendor-icons": ["lucide-react"],
          // Notifications
          "vendor-toast": ["sonner"],
          // Utility libs
          "vendor-utils": ["date-fns", "clsx", "class-variance-authority", "tailwind-merge"],
          // Animation
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
