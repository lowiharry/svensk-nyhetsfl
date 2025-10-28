import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/sitemap.xml': {
        target: 'https://bsrmueavzxvxkqvtrxcg.supabase.co/functions/v1/sitemap',
        changeOrigin: true,
        rewrite: () => '',
      },
      '/news-sitemap.xml': {
        target: 'https://bsrmueavzxvxkqvtrxcg.supabase.co/functions/v1/sitemap/news-sitemap.xml',
        changeOrigin: true,
        rewrite: () => '',
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
