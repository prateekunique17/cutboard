/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cb-black': '#0a0a0a',
        'cb-dark': '#121212',
        'cb-gray': '#222222',
        'cb-orange': '#F55C1A',
        'cb-amber': '#F9A826',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
