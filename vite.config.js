import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import macros from "unplugin-parcel-macros";

// https://vitejs.dev/config/
// React Spectrum S2: https://react-spectrum.adobe.com/getting-started
export default defineConfig({
  plugins: [
    macros.vite(),
    react()
  ],
  root: "client/example",
  publicDir: "public",
  build: {
    outDir: "./web",
    target: ["es2022"],
    cssMinify: "lightningcss",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/macro-(.*)\.css$/.test(id) || /@react-spectrum\/s2\/.*\.css$/.test(id)) {
            return "s2-styles";
          }
        }
      }
    }
  },
  server: {
    port: 9002,
    strictPort: true,
    hmr: {
      clientPort: 9002
    }
  }
});
