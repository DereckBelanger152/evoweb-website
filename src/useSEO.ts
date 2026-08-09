import { useEffect } from "react";

// Site sans routeur (voir main.tsx) : chaque page est un chargement complet
// distinct, donc pas besoin de restaurer les valeurs au démontage. Met à
// jour title, meta description, canonical et les balises Open Graph/Twitter
// déjà présentes dans index.html pour que chaque page ait ses propres
// métadonnées plutôt que d'hériter de celles de l'accueil.
type SEOOptions = {
  title: string;
  description: string;
  path: string;
};

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

export function useSEO({ title, description, path }: SEOOptions) {
  useEffect(() => {
    const url = `https://www.evoweb.ca${path}`;

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
