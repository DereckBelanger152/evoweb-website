/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        // Evoweb design tokens — evoweb-ops/design/design-tokens-evoweb.md
        // (Figma "Evoweb design system" v1.0, 7 août 2026)
        violet: {
          50: '#F6F1FE', 100: '#EADFFC', 200: '#D3BBF7', 300: '#B893F0', 400: '#9B6CE9',
          500: '#884DE0', 600: '#7635D5', 700: '#5E21BA', 800: '#481692', 900: '#300D63', 950: '#1D0A38',
        },
        neutral: {
          0: '#FFFFFF', 50: '#F7F6F8', 100: '#EFEEF2', 200: '#DCDAE2', 300: '#BEBAC9',
          400: '#9C97AA', 500: '#7C778D', 600: '#645F72', 700: '#4B4856', 800: '#312E38',
          850: '#252329', 900: '#1B1A1E', 925: '#141316', 950: '#09090B', 1000: '#000000',
        },
        success: { 300: '#A8E6CC', 500: '#2E9E6F', 700: '#1D724F' },
        danger: { 300: '#F7A1A6', 500: '#E14751', 700: '#B6202A' },
        warning: { 300: '#F7D8A1', 500: '#F3A216', 700: '#B3770F' },
      },
    },
  },
  plugins: [],
};
