// Écrit un fichier HTML par route à partir de dist/index.html, avec les
// bonnes balises <title>, description, canonical et Open Graph.
//
// Pourquoi : le site est une application React d'une seule page. Les
// métadonnées sont posées par JavaScript une fois la page chargée (voir
// src/useSEO.ts). Or les robots d'aperçu — Facebook, LinkedIn, X, Slack,
// WhatsApp, iMessage — n'exécutent pas le JavaScript : ils lisent le HTML
// brut renvoyé par le serveur. Sans cette étape, partager le lien de la page
// Forfaits affiche le titre et la description de la page d'accueil, et son
// <link rel="canonical"> pointe vers « / », ce qui invite Google à traiter
// Forfaits comme un doublon de l'accueil et à ne pas l'indexer.
//
// vercel.json réécrit /forfaits vers /forfaits.html (et non plus vers
// /index.html) pour que ces fichiers soient réellement servis.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const routes = JSON.parse(
  await readFile(join(root, "src", "seo-routes.json"), "utf8"),
);

const SITE = "https://www.evoweb.ca";
const template = await readFile(join(dist, "index.html"), "utf8");

// Remplace le contenu d'une balise précise, repérée par son attribut. Une
// expression régulière suffit et reste lisible : le gabarit est un fichier
// que nous écrivons nous-mêmes, pas du HTML arbitraire.
function replaceAttr(html, matcher, attr, value) {
  const pattern = new RegExp(`(<[^>]*${matcher}[^>]*${attr}=")[^"]*(")`, "i");
  if (!pattern.test(html)) {
    throw new Error(`Balise introuvable dans dist/index.html : ${matcher}`);
  }
  return html.replace(pattern, `$1${escapeAttr(value)}$2`);
}

function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function escapeText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

for (const [path, { title, description }] of Object.entries(routes)) {
  if (path === "/") continue; // dist/index.html est déjà correct.

  const url = `${SITE}${path}`;
  let html = template;

  html = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeText(title)}</title>`,
  );
  html = replaceAttr(html, 'rel="canonical"', "href", url);
  html = replaceAttr(html, 'name="description"', "content", description);
  html = replaceAttr(html, 'property="og:title"', "content", title);
  html = replaceAttr(html, 'property="og:description"', "content", description);
  html = replaceAttr(html, 'property="og:url"', "content", url);
  html = replaceAttr(html, 'name="twitter:title"', "content", title);
  html = replaceAttr(html, 'name="twitter:description"', "content", description);

  const file = `${path.replace(/^\//, "")}.html`;
  await writeFile(join(dist, file), html, "utf8");
  console.log(`prerender-meta: dist/${file}`);
}
