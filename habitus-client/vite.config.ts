import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0", // доступ с других устройств
    port: 5173,

    https: {
      key: fs.readFileSync("./certs/192.168.3.63-key.pem"),
      cert: fs.readFileSync("./certs/192.168.3.63.pem"),
    },

proxy: {
  "/api": {
    target: "https://192.168.3.63:3000",
    changeOrigin: true,
    secure: false,
  },
}
  },
});