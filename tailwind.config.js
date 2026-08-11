/** @type {import('tailwindcss').Config} */

// `rgb(var(--x) / <alpha-value>)` plutôt que `var(--x)` : Tailwind remplace
// `<alpha-value>` par l'opacité demandée, ce qui rend `bg-canvas/95` et
// `text-fg/60` utilisables. Avec une couleur hexadécimale dans la variable,
// ces modificateurs seraient silencieusement ignorés.
const themed = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      // Uniquement des noms sémantiques : les valeurs vivent dans les
      // variables CSS de src/index.css, qui basculent avec la classe `.dark`.
      // Aucune échelle brute (violet-600, neutral-800) n'est exposée ici, pour
      // qu'on ne puisse pas court-circuiter le thème depuis le JSX.
      colors: {
        canvas: themed('canvas'),
        surface: themed('surface'),
        sunken: themed('sunken'),
        fg: themed('fg'),
        muted: themed('muted'),
        line: themed('line'),
        'line-sunken': themed('line-sunken'),
        'on-sunken': themed('on-sunken'),
        'muted-sunken': themed('muted-sunken'),
        'accent-sunken': themed('accent-sunken'),
        accent: themed('accent'),
        'accent-subtle': themed('accent-subtle'),
        brand: themed('brand'),
        'on-brand': themed('on-brand'),
        success: themed('success'),
        danger: themed('danger'),
        warning: themed('warning'),
      },
    },
  },
  plugins: [],
};
