import { createContext, useContext } from "react";

export type Theme = {
  isDark: boolean;
  toggleTheme: () => void;
};

// Pas de valeur par défaut plausible : un composant rendu hors du provider est
// un bug de câblage, pas un cas à absorber en silence avec un thème arbitraire.
export const ThemeContext = createContext<Theme | null>(null);

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme() doit être appelé à l'intérieur de <ThemeProvider>.");
  }
  return theme;
}
