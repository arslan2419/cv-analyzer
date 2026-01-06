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
        // Sophisticated dark theme palette
        background: {
          DEFAULT: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a25',
          elevated: '#22222f',
        },
        foreground: {
          DEFAULT: '#fafafa',
          muted: '#a0a0b0',
          subtle: '#6b6b7b',
        },
        accent: {
          primary: '#6366f1', // Indigo
          secondary: '#8b5cf6', // Violet
          success: '#10b981', // Emerald
          warning: '#f59e0b', // Amber
          danger: '#ef4444', // Red
          info: '#06b6d4', // Cyan
        },
        border: {
          DEFAULT: '#2a2a3a',
          muted: '#1f1f2f',
          accent: '#3b3b4f',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-cabinet)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 
          'radial-gradient(at 40% 20%, hsla(240, 100%, 74%, 0.1) 0px, transparent 50%), ' +
          'radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.08) 0px, transparent 50%), ' +
          'radial-gradient(at 0% 50%, hsla(274, 100%, 74%, 0.08) 0px, transparent 50%), ' +
          'radial-gradient(at 80% 50%, hsla(240, 100%, 74%, 0.05) 0px, transparent 50%), ' +
          'radial-gradient(at 0% 100%, hsla(274, 100%, 74%, 0.06) 0px, transparent 50%)',
        'hero-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
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
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;

