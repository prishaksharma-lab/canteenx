/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF6F3',
          100: '#FBEFEA',
          200: '#F6DDD2',
          500: '#C55A33',
          600: '#AA4723',
          700: '#8E3415',
        },
        oatmeal: {
          50: '#FAF7F2',
          100: '#F3EFE9',
          200: '#ECE6DD',
          300: '#E5DFD5',
        },
        status: {
          pending: '#B45309',
          prep: '#C25E38',
          ready: '#4338CA',
          collected: '#52525B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
