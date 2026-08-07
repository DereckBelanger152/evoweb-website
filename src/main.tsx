import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Confidentialite from './Confidentialite.tsx';
import { ThemeProvider } from './ThemeContext';
import './index.css';

// Routage minimal : le site est une page unique, plus la politique de
// confidentialité exigée par la Loi 25. Vercel réécrit toutes les routes vers
// index.html (voir vercel.json), donc un accès direct à /confidentialite
// fonctionne.
const path = window.location.pathname.replace(/\/+$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {path === '/confidentialite' ? <Confidentialite /> : <App />}
    </ThemeProvider>
  </StrictMode>
);