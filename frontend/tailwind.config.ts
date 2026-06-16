import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: { 50: '#fff1f2', 100: '#ffe4e6', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
        peach: { 100: '#fde8d8', 300: '#f9b894', 500: '#f47c30' },
        cream: '#fdf6ec',
        lavender: { 100: '#ede9fe', 300: '#c4b5fd', 500: '#8b5cf6' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'sparkle': 'sparkle 0.6s ease-out forwards',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        heartbeat: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } },
        sparkle: { '0%': { opacity: '0', transform: 'scale(0)' }, '60%': { opacity: '1', transform: 'scale(1.3)' }, '100%': { opacity: '0', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}

export default config
