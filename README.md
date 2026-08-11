# Evoweb — site web

Site officiel d'Evoweb : [evoweb.ca](https://www.evoweb.ca)

## Stack

React 18 · TypeScript · Tailwind CSS · Vite · Framer Motion, déployé sur Vercel.

## Structure

```text
api/contact.ts     Fonction serverless du formulaire de contact (Resend)
src/               Application React
  seo-routes.json  Titres et descriptions — source unique, lue aussi au build
  tokens.ts        Couleurs du design system (ne pas coder de hex ailleurs)
  legal.ts         Identité légale affichée au pied de page
public/            Images, robots.txt, sitemap.xml, 404.html
scripts/           Étapes de build
```

Trois routes : `/`, `/forfaits`, `/confidentialite`. Le routage se fait dans
`src/main.tsx` d'après `window.location.pathname` ; `vercel.json` réécrit les
deux routes secondaires vers leur fichier HTML prérendu.

## Développement

```bash
npm install
npm run dev      # serveur local Vite
npm run build    # build de production + prérendu des métadonnées
npm run lint
```

Le formulaire de contact ne fonctionne pas avec `npm run dev` : il appelle une
fonction serverless. Utiliser `vercel dev` avec un `.env.local` rempli d'après
`.env.example`.

## Variables d'environnement

`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` — voir
`.env.example`. Ce sont des variables serveur : ne jamais les préfixer par
`VITE_`, sinon Vite les publierait dans le bundle envoyé au navigateur.

## Notes

- `api/` ne doit rien importer hors de `api/`. Le paquet est en
  `"type": "module"` : un import relatif sans extension casse la fonction au
  chargement une fois déployée.
- Les titres et descriptions se modifient dans `src/seo-routes.json`
  uniquement. `scripts/prerender-meta.mjs` s'en sert pour écrire un HTML par
  route, ce que lisent les robots d'aperçu des réseaux sociaux.

## Contact

[evoweb.ca](https://www.evoweb.ca/#contact) ·
[LinkedIn](https://www.linkedin.com/in/dereck-bélanger-437259338/)
