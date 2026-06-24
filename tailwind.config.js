/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Derived from the logo's core violet (#7033D8)
        accent: '#7635D5',
        'accent-light': '#9B6CE9',
        ink: '#0C0A14',
        parchment: '#FAFAF9',
      },
    },
  },
  plugins: [],
};
