import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * The frontend talks to the auth API with same-origin paths (`/auth/session`,
 * `/auth/logout`, `/api/*`) so the HttpOnly session cookie works without any
 * CORS/credential juggling in the browser. In development the API runs on its
 * own port, so those paths have to be proxied — without this the dev server
 * answered `/auth/session` with index.html, `res.json()` threw, and the nav
 * silently fell back to the logged-out state (no Discord avatar).
 *
 * Point it somewhere else with MOCHA_API_URL / VITE_API_URL when the backend
 * is not on localhost:8000.
 */
const API_TARGET = process.env.MOCHA_API_URL ?? process.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/*
 * Origin the backend trusts (its CORS_ORIGINS / FRONTEND_URL). The proxy sends
 * it so the API's CSRF origin guard accepts state-changing calls such as
 * POST /auth/logout when the site is opened through a tunnel or preview host.
 */
const API_ORIGIN = process.env.MOCHA_API_ORIGIN ?? process.env.FRONTEND_URL ?? "http://localhost:5173";

const apiProxy = {
  target: API_TARGET,
  changeOrigin: false,
  secure: false,
  headers: { Origin: API_ORIGIN },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app", ".ngrok-free.dev", "skeleton-barmaid-throat.ngrok-free.dev"],
    proxy: {
      "/auth": apiProxy,
      "/api": apiProxy,
      "/health": apiProxy,
    },
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app", ".ngrok-free.dev"],
    proxy: {
      "/auth": apiProxy,
      "/api": apiProxy,
      "/health": apiProxy,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
