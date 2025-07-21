/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
        },
        graphite: {
          100: 'var(--color-graphite-100, #333333)',
          200: 'var(--color-graphite-200, #252525)',
          300: 'var(--color-graphite-300, #1F1F1F)',
          400: 'var(--color-graphite-400, #181818)',
          500: 'var(--color-graphite-500, #141414)',
        },
        accent: {
          DEFAULT: '#0066FF',
          muted: '#0055CC',
          subtle: 'rgba(0, 102, 255, 0.15)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          subtle: 'var(--color-text-subtle)',
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