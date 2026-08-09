import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {page}
    </ThemeProvider>
  </StrictMode>
);