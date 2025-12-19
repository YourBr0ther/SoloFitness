import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background colors - Solo Leveling dark theme
        background: {
          darker: '#050810',
          dark: '#0a0e1a',
          card: '#0d1424',
          elevated: '#121a2e',
        },
        // Primary blue palette
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1976d2',
          700: '#1565c0',
          800: '#0d47a1',
          900: '#0a1929',
        },
        // Accent colors
        accent: {
          cyan: '#00e5ff',
          purple: '#9c27b0',
          magenta: '#e040fb',
        },
        // Status colors
        success: '#00e676',
        warning: '#ff9100',
        danger: '#ff1744',
        streak: '#ff6d00',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'streak-fire': 'streakFire 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'particle': 'particle 4s linear infinite',
        'level-up': 'levelUp 1s ease-out',
        'counter-pop': 'counterPop 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 5px #2196f3, 0 0 10px #2196f3' },
          '100%': { boxShadow: '0 0 15px #42a5f5, 0 0 30px #42a5f5, 0 0 45px #42a5f5' },
        },
        streakFire: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.1)', filter: 'brightness(1.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        particle: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) translateX(50px)', opacity: '0' },
        },
        levelUp: {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.5) rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        counterPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(33, 150, 243, 0.5), 0 0 40px rgba(33, 150, 243, 0.3)',
        'glow-cyan': '0 0 15px rgba(0, 229, 255, 0.6), 0 0 30px rgba(0, 229, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(156, 39, 176, 0.5), 0 0 40px rgba(156, 39, 176, 0.3)',
        'glow-success': '0 0 15px rgba(0, 230, 118, 0.6)',
        'glow-streak': '0 0 20px rgba(255, 109, 0, 0.6), 0 0 40px rgba(255, 109, 0, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
