import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext } from "./theme-context";

const STORAGE_KEY = "darkMode";

// Couleurs de la barre d'adresse mobile — --canvas des deux thèmes. Ce sont
// les deux seules valeurs hexadécimales de src/ hors de index.css : une balise
// <meta> ne peut pas lire une variable CSS.
const THEME_COLOR = { dark: "#141316", light: "#F7F6F8" };

// Le sombre est le thème de la marque : sans préférence enregistrée on y
// reste, plutôt que de suivre le réglage du système.
//
// Lu dans l'initialiseur de useState plutôt que dans un effet : un effet
// s'exécute après le premier rendu, donc un visiteur ayant choisi le thème
// clair voyait la page apparaître en sombre puis basculer sous ses yeux.
// L'équivalent côté HTML est le petit script en tête d'index.html, qui retire
// la classe `dark` avant même que React démarre.
function readStoredPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    // Navigation privée ou stockage bloqué par le navigateur.
    return true;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(readStoredPreference);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? THEME_COLOR.dark : THEME_COLOR.light);
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark));
    } catch {
      // Le thème reste appliqué pour la session, seule la mémoire est perdue.
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((wasDark) => !wasDark), []);

  // Sans useMemo, cet objet change d'identité à chaque rendu du provider et
  // force un nouveau rendu de tous les consommateurs du contexte.
  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
