import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tinymce from "vite-plugin-tinymce";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tinymce()],
  resolve: {
    alias: {
      // Assurez-vous que tinymce est correctement résolu
      tinymce: resolve(__dirname, "node_modules/tinymce"),
    },
  },
});
