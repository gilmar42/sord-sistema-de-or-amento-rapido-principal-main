/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./sord-frontend/index.html",
    "./sord-frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {},
  },
  plugins: [],
}
