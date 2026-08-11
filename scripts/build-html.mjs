// Étape de build exécutée après `vite build`. Elle fait quatre choses que Vite
// ne fait pas et qui, sans elle, cassent silencieusement en production.
//
// 1. UN FICHIER HTML PAR ROUTE. Le site est une application React d'une seule
//    page : les métadonnées sont posées par JavaScript une fois la page
//    chargée (src/useSEO.ts). Or les robots d'aperçu — Facebook, LinkedIn, X,
//    Slack, WhatsApp, iMessage — n'exécutent pas le JavaScript : ils lisent le
//    HTML brut renvoyé par le serveur. Sans cette étape, partager
//    evoweb.ca/forfaits affiche le titre de la page d'accueil, et son
//    <link rel="canonical"> pointe vers « / », ce qui invite Google à traiter
//    Forfaits comme un doublon et à ne pas l'indexer.
//
// 2. DONNÉES STRUCTURÉES PAR ROUTE. La FAQ de /forfaits est déclarée en
//    schema.org FAQPage, ce qui permet à Google d'afficher les questions
//    directement dans ses résultats. Le texte est lu depuis src/faq.json, la
//    même source que le composant React : deux copies divergeraient.
//
// 3. INDICES DE CHARGEMENT. Le navigateur ne peut pas deviner le nom haché des
//    fichiers produits par Vite. On insère donc ici le préchargement des deux
//    polices critiques et le `modulepreload` du lot JavaScript propre à chaque
//    route, pour que celui-ci parte en parallèle du lot principal au lieu
//    d'attendre son exécution.
//
// 4. VÉRIFICATION DE LA POLITIQUE DE SÉCURITÉ. Le petit script antiscintillement
//    d'index.html est autorisé par son empreinte SHA-256 inscrite dans
//    vercel.json. Modifier le script sans mettre l'empreinte à jour le ferait
//    bloquer par le navigateur en production, et le thème clair scintillerait
//    de nouveau — sans la moindre erreur au build. On échoue donc ici.

import { createHash } from "node:crypto";
import { readFile, writeFile, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SITE = "https://www.evoweb.ca";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const readJson = async (...path) => JSON.parse(await readFile(join(root, ...path), "utf8"));

const routes = await readJson("src", "seo-routes.json");
const faq = await readJson("src", "faq.json");
const vercelConfig = await readJson("vercel.json");

// Vite associe chaque module d'entrée à son fichier de sortie haché.
const manifest = await readJson("dist", ".vite", "manifest.json");
const assets = await readdir(join(dist, "assets"));

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const escapeText = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// `</script>` à l'intérieur d'une chaîne JSON fermerait la balise et le reste
// des données serait interprété comme du HTML.
const embedJson = (value) => JSON.stringify(value, null, 2).replace(/</g, "\\u003c");

// Remplace la valeur d'un attribut sur une balise repérée par un autre de ses
// attributs. Une expression régulière suffit : le gabarit est un fichier que
// nous écrivons nous-mêmes, pas du HTML arbitraire. L'échec est fatal — une
// balise renommée dans index.html doit se voir tout de suite, pas se traduire
// par un aperçu social muet trois semaines plus tard.
function replaceAttr(html, matcher, attr, value) {
  const pattern = new RegExp(`(<[^>]*${matcher}[^>]*${attr}=")[^"]*(")`, "i");
  if (!pattern.test(html)) {
    throw new Error(`Balise introuvable dans dist/index.html : ${matcher}`);
  }
  return html.replace(pattern, `$1${escapeAttr(value)}$2`);
}

function insertBeforeHeadEnd(html, snippet) {
  return html.replace("</head>", `${snippet}\n  </head>`);
}

// ── 4. Empreinte du script antiscintillement ────────────────────────────────
const template = await readFile(join(dist, "index.html"), "utf8");

// Uniquement les scripts réellement exécutables : un bloc
// `type="application/ld+json"` est une donnée, jamais exécutée, et la politique
// de sécurité du contenu ne s'y applique pas.
const inlineScripts = [...template.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attrs]) => !/type\s*=\s*"(?!text\/javascript)/i.test(attrs))
  .map(([, , body]) => body);

const csp = vercelConfig.headers
  .flatMap((entry) => entry.headers)
  .find((header) => header.key === "Content-Security-Policy")?.value;

if (!csp) throw new Error("Aucun en-tête Content-Security-Policy dans vercel.json.");

for (const body of inlineScripts) {
  const hash = createHash("sha256").update(body, "utf8").digest("base64");
  if (!csp.includes(`'sha256-${hash}'`)) {
    throw new Error(
      "Un script en ligne d'index.html n'est pas autorisé par la politique de sécurité.\n" +
        `Ajouter cette empreinte à script-src dans vercel.json :\n\n    'sha256-${hash}'\n`,
    );
  }
}

// ── 3. Préchargement des polices ────────────────────────────────────────────
// Seules les deux polices du sous-ensemble latin sont préchargées : ce sont les
// seules dont un texte français a besoin. Précharger les autres coûterait de la
// bande passante pour des fichiers que le navigateur ne demanderait jamais.
const FONTS = [
  { family: "Bricolage Grotesque Variable", base: "bricolage-grotesque-latin-opsz-normal" },
  { family: "DM Sans Variable", base: "dm-sans-latin-opsz-normal" },
];

const fonts = FONTS.map(({ family, base }) => {
  const file = assets.find((name) => name.startsWith(base) && name.endsWith(".woff2"));
  if (!file) throw new Error(`Police critique absente de dist/assets : ${base}*.woff2`);
  return { family, url: `/assets/${file}` };
});

const withFontPreloads = insertBeforeHeadEnd(
  template,
  fonts
    .map(
      ({ url }) =>
        `    <link rel="preload" as="font" type="font/woff2" crossorigin href="${url}" />`,
    )
    .join("\n"),
);
await writeFile(join(dist, "index.html"), withFontPreloads, "utf8");

// dist/404.html est servi hors de l'application React : il ne partage ni sa
// feuille de style ni ses polices, et la politique de sécurité interdit
// désormais d'aller les chercher chez Google. On lui greffe donc les mêmes
// fichiers auto-hébergés, dont seul ce script connaît le nom haché.
const notFoundPath = join(dist, "404.html");
const notFound = await readFile(notFoundPath, "utf8");
const faces = fonts
  .map(
    ({ family, url }) => `      @font-face {
        font-family: "${family}";
        font-style: normal;
        font-weight: 200 800;
        font-display: swap;
        src: url("${url}") format("woff2-variations");
      }`,
  )
  .join("\n");

await writeFile(notFoundPath, notFound.replace("    <style>", `    <style>\n${faces}`), "utf8");
console.log("build-html: dist/404.html");

// ── 1 et 2. Une page par route ──────────────────────────────────────────────
function structuredDataFor(path, { title, description }) {
  const url = `${SITE}${path}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: title.split(" : ")[0], item: url },
    ],
  };

  if (path === "/forfaits") {
    return [
      breadcrumb,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ];
  }

  return [
    breadcrumb,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      inLanguage: "fr-CA",
      isPartOf: { "@id": `${SITE}/#website` },
    },
  ];
}

// Chemin du module React chargé à la demande pour cette route, tel que nommé
// dans src/main.tsx.
const ROUTE_MODULE = {
  "/forfaits": "src/Forfaits.tsx",
  "/confidentialite": "src/Confidentialite.tsx",
};

for (const [path, meta] of Object.entries(routes)) {
  if (path === "/") continue; // dist/index.html est déjà correct.

  const { title, description } = meta;
  const url = `${SITE}${path}`;
  let html = withFontPreloads;

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeText(title)}</title>`);
  html = replaceAttr(html, 'rel="canonical"', "href", url);
  html = replaceAttr(html, 'name="description"', "content", description);
  html = replaceAttr(html, 'property="og:title"', "content", title);
  html = replaceAttr(html, 'property="og:description"', "content", description);
  html = replaceAttr(html, 'property="og:url"', "content", url);
  html = replaceAttr(html, 'name="twitter:title"', "content", title);
  html = replaceAttr(html, 'name="twitter:description"', "content", description);

  const chunk = manifest[ROUTE_MODULE[path]]?.file;
  if (!chunk) throw new Error(`Lot introuvable au manifeste pour ${path} (${ROUTE_MODULE[path]}).`);

  html = insertBeforeHeadEnd(
    html,
    `    <link rel="modulepreload" href="/${chunk}" />\n` +
      structuredDataFor(path, meta)
        .map((data) => `    <script type="application/ld+json">\n${embedJson(data)}\n    </script>`)
        .join("\n"),
  );

  const file = `${path.replace(/^\//, "")}.html`;
  await writeFile(join(dist, file), html, "utf8");
  console.log(`build-html: dist/${file}`);
}

// ── Plan du site ────────────────────────────────────────────────────────────
// Généré plutôt que maintenu à la main : une date de dernière modification
// écrite en dur vieillit sans que personne s'en aperçoive, et une route ajoutée
// à seo-routes.json était jusqu'ici oubliée du plan.
const PRIORITY = { "/": "1.0", "/forfaits": "0.8", "/confidentialite": "0.3" };
const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(routes)
  .map(
    (path) => `  <url>
    <loc>${SITE}${path === "/" ? "/" : path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${PRIORITY[path] ?? "0.5"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");
console.log("build-html: dist/sitemap.xml");

// Le manifeste n'a servi qu'ici ; il n'a pas à être servi publiquement.
await rm(join(dist, ".vite"), { recursive: true, force: true });
