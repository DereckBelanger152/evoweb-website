import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // scripts/build-html.mjs s'en sert pour retrouver le nom haché du lot de
    // chaque route et en insérer le `modulepreload`. Le fichier est supprimé
    // de dist à la fin du build.
    manifest: true,
  },
});
