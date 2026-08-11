import { useEffect } from "react";
import routes from "./seo-routes.json";

const SITE = "https://www.evoweb.ca";

// Les titres et descriptions vivent dans seo-routes.json, pas ici ni dans les
// composants : scripts/build-html.mjs lit le même fichier au build pour écrire
// un vrai fichier HTML par route (forfaits.html, confidentialite.html).
// Facebook, LinkedIn, X, Slack et iMessage n'exécutent pas le JavaScript de la
// page — ils lisent le HTML brut renvoyé par le serveur. Si le titre n'existait
// qu'ici, partager evoweb.ca/forfaits afficherait l'aperçu de l'accueil.
//
// Ce hook reste nécessaire malgré le prérendu : il corrige l'onglet du
// navigateur et l'historique, et couvre les robots qui, eux, exécutent le JS.
//
// Site sans routeur (voir main.tsx) : chaque page est un chargement complet
// distinct, donc pas besoin de restaurer les valeurs au démontage.
export type SeoPath = keyof typeof routes;

function setMeta(selector: string, attribute: string, value: string) {
  document.querySelector(selector)?.setAttribute(attribute, value);
}

export function useSEO(path: SeoPath) {
  const { title, description } = routes[path];

  useEffect(() => {
    const url = `${SITE}${path}`;

    document.title = title;
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
  }, [title, description, path]);
}
