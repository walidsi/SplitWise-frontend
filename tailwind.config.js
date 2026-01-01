/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm terracotta palette
        terracotta: {
          50: '#fdf6f3',
          100: '#fceae4',
          200: '#fad8cc',
          300: '#f5bda8',
          400: '#ed9576',
          500: '#e2714d',
          600: '#cf5635',
          700: '#ad442a',
          800: '#8f3a27',
          900: '#773426',
        },
        // Deep forest green
        forest: {
          50: '#f3f8f5',
          100: '#e1efe6',
          200: '#c5dfce',
          300: '#9bc7ab',
          400: '#6ba882',
          500: '#498c64',
          600: '#37714f',
          700: '#2d5a41',
          800: '#274936',
          900: '#213c2e',
        },
        // Warm sand
        sand: {
          50: '#fdfcf9',
          100: '#faf7f0',
          200: '#f4eddc',
          300: '#ebe0c4',
          400: '#dfcd9f',
          500: '#d1b67a',
          600: '#c19f5c',
          700: '#a6844c',
          800: '#876b42',
          900: '#6e5838',
        },
        // Midnight blue accent
        midnight: {
          50: '#f4f6fa',
          100: '#e7ebf3',
          200: '#d4dcea',
          300: '#b5c3da',
          400: '#91a3c6',
          500: '#7586b5',
          600: '#636fa6',
          700: '#575f97',
          800: '#4a4f7c',
          900: '#3f4464',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
