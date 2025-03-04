/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6e8efb',
          light: '#8ba3fc',
          dark: '#5d7fe3',
        },
        secondary: {
          DEFAULT: '#a777e3',
          light: '#b68ae7',
          dark: '#9666d3',
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      ringColor: {
        primary: 'rgba(110, 142, 251, 0.1)',
      },
    },
  },
  plugins: [],
} 