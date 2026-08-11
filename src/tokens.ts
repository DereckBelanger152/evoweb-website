// Design tokens — mirrors evoweb-ops/design/design-tokens-evoweb.md
// (Figma "Evoweb design system" v1.0, 7 août 2026). This is the single
// source of truth for color values in this app; don't hardcode hex
// elsewhere — extend this file instead.

export const violet = {
  50: "#F6F1FE", 100: "#EADFFC", 200: "#D3BBF7", 300: "#B893F0", 400: "#9B6CE9",
  500: "#884DE0", 600: "#7635D5", 700: "#5E21BA", 800: "#481692", 900: "#300D63", 950: "#1D0A38",
} as const;

export const neutral = {
  0: "#FFFFFF", 50: "#F7F6F8", 100: "#EFEEF2", 200: "#DCDAE2", 300: "#BEBAC9",
  400: "#9C97AA", 500: "#7C778D", 600: "#645F72", 700: "#4B4856", 800: "#312E38",
  850: "#252329", 900: "#1B1A1E", 925: "#141316", 950: "#09090B", 1000: "#000000",
} as const;

export const status = {
  success: { 300: "#A8E6CC", 500: "#2E9E6F", 700: "#1D724F" },
  danger: { 300: "#F7A1A6", 500: "#E14751", 700: "#B6202A" },
  warning: { 300: "#F7D8A1", 500: "#F3A216", 700: "#B3770F" },
} as const;

export function tokensFor(isDark: boolean) {
  const pick = <T,>(dark: T, light: T) => (isDark ? dark : light);
  return {
    canvas: pick(neutral[925], neutral[50]),
    surface: pick(neutral[900], neutral[0]),
    sunken: neutral[950],
    accent: violet[600],
    accentSubtle: pick(violet[900], violet[50]),

    textPrimary: pick(neutral[100], neutral[900]),
    textMuted: pick(neutral[400], neutral[600]),
    onAccent: neutral[0],
    onSunken: neutral[100],
    // neutral[700] sur `sunken` (#09090B) ne donnait que 2,24:1 — sous le
    // 4,5:1 exigé par WCAG AA. C'est le texte du pied de page : NEQ, adresse
    // courriel et lien vers la politique de confidentialité, soit les
    // mentions exigées par la Loi 25. Elles doivent être lisibles.
    mutedOnSunken: neutral[400],
    textAccent: pick(violet[400], violet[600]),

    borderDefault: pick(neutral[800], neutral[200]),
    borderSunken: neutral[850],
    borderFocus: pick(violet[400], violet[600]),

    success: pick(status.success[300], status.success[700]),
    danger: pick(status.danger[300], status.danger[700]),
    warning: pick(status.warning[300], status.warning[700]),
  };
}

export type Tokens = ReturnType<typeof tokensFor>;
