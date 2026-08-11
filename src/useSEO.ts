import { useEffect } from "react";
import routes from "./seo-routes.json";

// Les titres et descriptions vivent dans seo-routes.json, pas ici ni dans les
// composants. Raison : scripts/prerender-meta.mjs lit le même fichier au
// build pour écrire un vrai fichier HTML par route (forfaits.html,
// confidentialite.html). Facebook, LinkedIn, X, Slack et iMessage n'exécutent
// pas le JavaScript de la page — ils lisent le HTML brut renvoyé par le
// serveur. Si le titre n'existait qu'ici, partager evoweb.ca/forfaits
// afficherait l'aperçu de la page d'accueil.
//
// Ce hook reste nécessaire malgré le prerender : il corrige l'onglet du
// navigateur et l'historique, et couvre les robots qui, eux, exécutent le JS.
//
// Site sans routeur (voir main.tsx) : chaque page est un chargement complet
// distinct, donc pas besoin de restaurer les valeurs au démontage.
export type SeoPath = keyof typeof routes;

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

export function useSEO(path: SeoPath) {
  const { title, description } = routes[path];

  useEffect(() => {
    const url = `https://www.evoweb.ca${path === "/" ? "/" : path}`;

    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', url);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  }, [title, description, path]);
}
