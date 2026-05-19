import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://brqjujfkwtmkgifstvaa.supabase.co";
const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIYnJxanVqZmtrdG1rZ2lmc3R2YWEiLCJyZWYiOiJicnFqdWpma3d0bWtnZ2lmc3R2YWEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3Mjk4NDA4NywiZXhwIjoyMDg4NTYwMDg3fQ.YUOSDoWHkid_4kowgnnxoSST8bA7qncW0qm9XBvUGHE";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
