/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_auth",
      filename: "remoteEntry.js",
      // Componentes expostos para o Shell consumir
      exposes: {
        "./LoginPage": "./src/pages/LoginPage",
        "./RegisterPage": "./src/pages/RegisterPage",
        "./UsersPage": "./src/pages/UsersPage",
        "./UpdateUserPage": "./src/pages/UpdateUserPage",
      },
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server: {
    port: 4001,
    host: true,
  },
  preview: {
    port: 4001,
    host: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    css: true,
  },
});
