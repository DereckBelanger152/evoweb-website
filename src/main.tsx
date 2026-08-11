import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { ThemeProvider } from "./ThemeProvider";
import "./index.css";

// Routage minimal : le site est une page unique, plus la politique de
// confidentialité exigée par la Loi 25 et la page de détail des forfaits.
// vercel.json réécrit ces deux routes vers leur fichier HTML prérendu, donc un
// accès direct fonctionne et chaque page sert déjà ses propres métadonnées.
//
// Les deux pages secondaires sont chargées à la demande : sans cela, leurs
// ~30 ko de texte partaient dans le lot de la page d'accueil, où atterrit
// l'essentiel du trafic et où se joue le temps d'affichage. L'accueil est
// importé normalement — le mettre aussi en `lazy` ajouterait un aller-retour
// réseau avant le premier rendu, exactement ce qu'on cherche à éviter.
// scripts/build-html.mjs insère un <link rel="modulepreload"> du bon lot dans
// forfaits.html et confidentialite.html : le navigateur le télécharge alors en
// parallèle du lot principal, sans attendre d'avoir exécuté celui-ci.
const Forfaits = lazy(() => import("./Forfaits"));
const Confidentialite = lazy(() => import("./Confidentialite"));

const path = window.location.pathname.replace(/\/+$/, "");

const page =
  path === "/confidentialite" ? <Confidentialite /> :
  path === "/forfaits" ? <Forfaits /> :
  <App />;

// <Analytics /> est monté ici plutôt que dans App : placé dans App, il ne se
// chargeait que sur l'accueil, et /forfaits — la page qui décide d'un achat —
// n'était mesurée nulle part.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <Suspense fallback={<div className="min-h-screen bg-canvas" />}>{page}</Suspense>
        <Analytics />
      </ThemeProvider>
    </MotionConfig>
  </StrictMode>,
);
