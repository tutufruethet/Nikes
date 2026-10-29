/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tinta: 'rgb(var(--ink-rgb) / <alpha-value>)',
        branco: 'rgb(var(--branco-rgb) / <alpha-value>)',
        acento: 'var(--accent)',
        fundo: 'var(--deep)',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        ui: ['Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
