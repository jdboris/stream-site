import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA } from "vite-plugin-pwa";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      manifest: true,
    },
    resolve: {
      alias: {
        "react-firebase-chat": path.resolve(
          __dirname,
          "./react-firebase-chat/src"
        ),
      },
    },
    plugins: [
      react(),
      basicSsl(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        strategies: "generateSW",
        pwaAssets: {
          image: "./assets/logo.png",
          integration: {
            outDir: `./dist/assets/`,
            baseUrl: "assets/",
          },
        },
        manifest: {
          name: env.VITE_SITE_NAME,
          short_name: env.VITE_SITE_NAME,
          description: env.VITE_SITE_DESCRIPTION,
          theme_color: "#ffffff",
          icons: [
            { src: "/assets/pwa-64x64.png", sizes: "64x64", type: "image/png" },
            {
              src: "assets/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/assets/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/assets/maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        "/api": {
          target: "https://localhost:443",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
      host: true,
    },
  };
});
