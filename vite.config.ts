import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "CampX",
        short_name: "CampX",
        description: "Exclusive verifiable college community",
        theme_color: "#070709",
        background_color: "#070709",
        display: "standalone",
        icons: [
            {
                src: "vite.svg", // Fallback for the PWA check
                sizes: "192x192 512x512",
                type: "image/svg+xml",
            }
        ]
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        contact: path.resolve(__dirname, "contact.html"),
        privacy: path.resolve(__dirname, "privacy.html"),
        terms: path.resolve(__dirname, "terms.html"),
        refunds: path.resolve(__dirname, "refunds.html"),
      },
    },
  },
});

