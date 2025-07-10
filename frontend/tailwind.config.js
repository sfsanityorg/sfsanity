/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0A0A',
          secondary: '#111111',
          tertiary: '#1A1A1A',
        },
        graphite: {
          100: '#333333',
          200: '#252525',
          300: '#1F1F1F',
          400: '#181818',
          500: '#141414',
        },
        accent: {
          DEFAULT: '#0066FF',
          muted: '#0055CC',
          subtle: 'rgba(0, 102, 255, 0.15)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.45)',
          subtle: 'rgba(255, 255, 255, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Sohne', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Neue Haas Grotesk', 'Sohne', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'title': ['3.5rem', { lineHeight: '1.2', fontWeight: '500' }],
        'subtitle': ['1.125rem', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '34': '8.5rem',
        '68': '17rem',
      },
      transitionProperty: {
        'position': 'top, right, bottom, left',
        'sizing': 'width, height',
      },
      animation: {
        'magnetic-hover': 'magnetic 10s ease infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        magnetic: {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(2px, 2px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
    },
  },
  plugins: [],
};