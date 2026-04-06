import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.{css,js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // High Contrast Dark Blue Theme
        primary: '#0a0f1f',
        secondary: '#1a1f36',
        accent: '#4299e1',
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565',
        info: '#4299e1',
        
        // Semantic colors - Enhanced Contrast
        background: '#0a0f1f',
        surface: '#1e2947',
        border: '#2d3748',
        'text-primary': '#ffffff',
        'text-secondary': '#e2e8f0',
        'text-tertiary': '#a0aec0',
        'text-inverse': '#0a0f1f',
        
        // Darker Theme
        'dark-bg': '#030712',
        'dark-surface': 'rgba(12, 18, 41, 0.8)',
        'dark-border': 'rgba(45, 55, 72, 0.2)',
        'dark-text-primary': '#ffffff',
        'dark-text-secondary': '#e2e8f0',
        'dark-text-tertiary': '#a0aec0',
        'dark-text-inverse': '#030712',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
        xl: '0 12px 32px rgba(0, 0, 0, 0.6)',
        '2xl': '0 20px 40px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'heart-pop': 'heartPop 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
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
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
} satisfies Config
