/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          50: '#e7f3ff',
          100: '#d0e7ff',
          200: '#a8d4ff',
          300: '#74b9ff',
          400: '#3d94ff',
          500: '#0a66c2',
          600: '#004182',
          700: '#002952',
          800: '#001829',
          900: '#000a14',
        }
      }
    },
  },
  plugins: [],
}
