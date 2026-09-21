import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import fs from "node:fs";
import path from "node:path";

const PAGES_BASE = "/christian-food-pantry-intake/";
const dir = import.meta.dirname;

function viteHtmlAsIndex(): Plugin {
  return {
    name: "vite-html-as-index",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/" || req.url === "/index.html") {
          req.url = "/index.vite.html";
        }
        next();
      });
    },
    closeBundle() {
      const from = path.join(dir, "dist", "index.vite.html");
      const to = path.join(dir, "dist", "index.html");
      if (fs.existsSync(from)) fs.renameSync(from, to);
    },
  };
}

export default defineConfig(({ command }) => ({
  base: command === "build" ? PAGES_BASE : "/",
  plugins: [
    react(),
    tailwindcss(),
    viteHtmlAsIndex(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "icon.svg",
        "apple-touch-icon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "404.html",
      ],
      manifest: {
        id: PAGES_BASE,
        name: "Shady Hills Mission Chapel — Pantry Check-in",
        short_name: "Pantry Check-in",
        description:
          "Household intake for Shady Hills Mission Chapel. One visit per household per calendar month.",
        theme_color: "#1c4d3a",
        background_color: "#f4efe6",
        display: "standalone",
        orientation: "any",
        scope: PAGES_BASE,
        start_url: PAGES_BASE,
        lang: "en",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dir, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(dir, "index.vite.html"),
    },
  },
  preview: {
    port: 4173,
  },
}));
