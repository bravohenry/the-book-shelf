/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./newtab.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hand: ['"Patrick Hand"', 'cursive'],
        sans: ['"Fredoka"', 'sans-serif'],
      },
      colors: {
        'shelf-wood': '#cdbba7', /* Steady Vintage Wood */
        'shelf-shadow': '#b5a493', /* Deep Wood Shadow */
        'paper': '#fdfbf7',
        'ink': '#4a4a4a',
        'cream': '#f8f4f1',
        'cardboard': '#dcbfa3',
        'cardboard-dark': '#c5a582',
      },
      boxShadow: {
        'book': '1px 1px 3px rgba(0,0,0,0.15), inset -1px -1px 2px rgba(0,0,0,0.05)',
        'book-hover': '0px 10px 20px rgba(0,0,0,0.1)',
        'soft': '0 4px 20px rgba(0,0,0,0.05)',
        'inner-spine': 'inset 10px 0 20px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'noise': "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.04%22/%3E%3C/svg%3E')",
      }
    }
  },
  plugins: [],
}

