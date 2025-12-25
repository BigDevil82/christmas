/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        cursive: ['"Great Vibes"', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        gold: '#FFD700',
        glass: 'rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
