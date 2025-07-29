/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#1976d2',
          600: '#1565c0',
          700: '#0d47a1',
          800: '#0a1929',
          900: '#0a0e1a',
        },
        accent: {
          cyan: '#00e5ff',
          blue: '#42a5f5',
        },
        background: {
          dark: '#0a0e1a',
          navy: '#0a1929',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Bebas Neue', 'cursive'],
      },
      animation: {
        'particle-float': 'particleFloat 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'typewriter': 'typewriter 4s steps(40) 1s 1 normal both',
        'level-up': 'levelUp 1s ease-out',
      },
      keyframes: {
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.3' },
          '33%': { transform: 'translateY(-30px) translateX(10px)', opacity: '0.8' },
          '66%': { transform: 'translateY(-10px) translateX(-10px)', opacity: '0.5' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 5px #1976d2, 0 0 10px #1976d2, 0 0 15px #1976d2' },
          '100%': { boxShadow: '0 0 10px #42a5f5, 0 0 20px #42a5f5, 0 0 30px #42a5f5' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        levelUp: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}