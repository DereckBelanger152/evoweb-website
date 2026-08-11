# Evoweb — site web

Site officiel d'Evoweb : [evoweb.ca](https://www.evoweb.ca)

## Stack

React 18 · TypeScript · Tailwind CSS · Vite · Framer Motion, déployé sur Vercel.

## Structure

```text
api/contact.ts       Fonction serverless du formulaire de contact (Resend)
scripts/
  build-html.mjs     Étape post-build : HTML par route, données structurées,
                     indices de préchargement, sitemap, vérification de la CSP
src/
  index.css          Jetons de design (variables CSS) — source unique des couleurs
  seo-routes.json    Titres et descriptions — lus aussi au build
  faq.json           FAQ — lue par Forfaits.tsx et par le build (schema.org)
  legal.ts           Identité légale affichée au pied de page
public/              Images, icônes, robots.txt, 404.html, manifeste
```

Trois routes : `/`, `/forfaits`, `/confidentialite`. Le routage se fait dans
`src/main.tsx` d'après `window.location.pathname` ; `vercel.json` réécrit les
deux routes secondaires vers leur fichier HTML prérendu. Les deux pages
secondaires sont chargées à la demande pour ne pas alourdir l'accueil.

## Développement

```bash
npm install
npm run dev        # serveur local Vite
npm run build      # build de production + étape build-html
npm run typecheck
npm run lint
```

Le formulaire de contact ne fonctionne pas avec `npm run dev` : il appelle une
fonction serverless. Utiliser `vercel dev` avec un `.env.local` rempli d'après
`.env.example`.

## Variables d'environnement

`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` — voir
`.env.example`. Ce sont des variables serveur : ne jamais les préfixer par
`VITE_`, sinon Vite les publierait dans le lot envoyé au navigateur.

## Ce qu'il faut savoir avant de modifier

### Couleurs

Toutes les couleurs sont des variables CSS déclarées dans `src/index.css`, en
deux étages : une palette brute, puis des jetons sémantiques (`--canvas`,
`--fg`, `--muted`, `--line`, `--accent`…) qui basculent avec la classe `.dark`
posée sur `<html>`. `tailwind.config.js` n'expose que les noms sémantiques,
d'où des classes comme `bg-canvas`, `text-muted`, `border-line`.

Ne pas écrire de valeur hexadécimale dans `src/` : changer de thème ne
passerait alors plus par le même chemin. Deux exceptions documentées,
`public/404.html` et `api/contact.ts`, servies hors de l'application React.

Les valeurs sont écrites en canaux RVB (`247 246 248`) et non en hexadécimal,
pour que Tailwind puisse y appliquer une opacité : c'est ce qui rend
`bg-canvas/95` possible.

### Politique de sécurité du contenu

`script-src` ne contient pas `'unsafe-inline'`. Le seul script en ligne du site
est celui qui évite le scintillement de thème dans `index.html` ; il est
autorisé par son empreinte SHA-256 inscrite dans `vercel.json`.

**Modifier ce script casse la page en production si l'empreinte n'est pas mise
à jour.** `npm run build` échoue alors avec la nouvelle valeur à recopier.

`style-src` garde `'unsafe-inline'` : React et Framer Motion posent des
attributs `style` sur les éléments qu'ils animent.

### Polices

Auto-hébergées via `@fontsource`, importées en tête de `src/index.css`. Elles
ne viennent plus de `fonts.googleapis.com` : le navigateur n'a plus à ouvrir de
connexion vers deux domaines tiers avant de peindre le premier texte, et
l'adresse IP des visiteurs n'est plus transmise à Google — ce que la politique
de confidentialité promet.

`scripts/build-html.mjs` insère le préchargement des deux polices du
sous-ensemble latin, et greffe les mêmes fichiers sur `404.html`, qui est servi
hors de l'application.

### Métadonnées et données structurées

Les titres et descriptions se modifient dans `src/seo-routes.json` uniquement,
la FAQ dans `src/faq.json`. `scripts/build-html.mjs` s'en sert pour écrire un
HTML par route — ce que lisent les robots d'aperçu des réseaux sociaux, qui
n'exécutent pas le JavaScript — et pour produire les données structurées
`FAQPage` et `BreadcrumbList`. Le sitemap est généré au build, avec la date du
jour.

### Fonction serverless

`api/` ne doit rien importer hors de `api/`. Le paquet est en
`"type": "module"` : un import relatif sans extension casse la fonction au
chargement une fois déployée, et toute soumission du formulaire retourne 500.

## Contact

[evoweb.ca](https://www.evoweb.ca/#contact) ·
[LinkedIn](https://www.linkedin.com/in/dereck-bélanger-437259338/)
