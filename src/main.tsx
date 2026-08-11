import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { MotionConfig } from 'framer-motion';
import App from './App.tsx';
import Confidentialite from './Confidentialite.tsx';
import Forfaits from './Forfaits.tsx';
import { ThemeProvider } from './ThemeContext';
import './index.css';

// Routage minimal : le site est une page unique, plus la politique de
// confidentialité exigée par la Loi 25 et la page de détail des forfaits.
// Vercel réécrit ces routes vers index.html (voir vercel.json), donc un accès
// direct à /confidentialite ou /forfaits fonctionne.
const path = window.location.pathname.replace(/\/+$/, '');

const page =
  path === '/confidentialite' ? <Confidentialite /> :
  path === '/forfaits'        ? <Forfaits /> :
  <App />;

// <Analytics /> est monté ici plutôt que dans App : placé dans App, il ne se
// chargeait que sur l'accueil, et /forfaits — la page qui décide d'un achat —
// n'était mesurée nulle part.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        {page}
        <Analytics />
      </ThemeProvider>
    </MotionConfig>
  </StrictMode>
);