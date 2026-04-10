import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Accent green — #10B981 (CTA, active states)
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Deep navy — #0A2540 (primary text, nav, hero bg)
        navy: {
          500: '#0F3A5F',
          700: '#0A2540',
          900: '#071B30',
        },
      },
      boxShadow: {
        'card': '0 4px 12px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 8px 24px rgba(15, 23, 42, 0.12)',
        'modal': '0 12px 32px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
