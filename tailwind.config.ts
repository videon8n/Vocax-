import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          50: '#F5F5F7',
          100: '#E7E7EC',
          200: '#C7C7D1',
          300: '#9A9AAA',
          400: '#6E6E80',
          500: '#4A4A5A',
          600: '#2E2E3A',
          700: '#1E1E26',
          800: '#16161C',
          900: '#0E0E12',
          950: '#08080B',
        },
        amber: {
          DEFAULT: '#F5A65B',
          soft: '#F8C189',
        },
        magenta: {
          DEFAULT: '#E0457B',
          soft: '#EE7BA5',
        },
        sage: '#7BCFA8',
        warn: '#F5C25B',
        danger: '#E85F5F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // base mínimo de 17px para acessibilidade idosos
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],
        base: ['1.0625rem', { lineHeight: '1.6rem' }],
        lg: ['1.1875rem', { lineHeight: '1.75rem' }],
        xl: ['1.375rem', { lineHeight: '1.9rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.2rem' }],
        '3xl': ['2.25rem', { lineHeight: '2.6rem' }],
        '4xl': ['2.875rem', { lineHeight: '3.1rem' }],
        '5xl': ['3.75rem', { lineHeight: '1.05' }],
        '6xl': ['4.75rem', { lineHeight: '1.05' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '36px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        240: '240ms',
        360: '360ms',
      },
      backgroundImage: {
        'vocax-gradient':
          'linear-gradient(135deg, #F5A65B 0%, #E0457B 100%)',
        'vocax-radial':
          'radial-gradient(ellipse at top, rgba(245,166,91,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(224,69,123,0.15), transparent 55%)',
      },
      animation: {
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'breath': 'breath 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
