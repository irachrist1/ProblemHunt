import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0A0A0B',
          secondary: '#111114',
          tertiary:  '#18181C',
          overlay:   '#222228',
          input:     '#16161A',
        },
        border: {
          subtle:  'rgba(255,255,255,0.05)',
          default: 'rgba(255,255,255,0.09)',
          strong:  'rgba(255,255,255,0.15)',
          focus:   'rgba(249,115,22,0.50)',
        },
        text: {
          primary:   '#FAFAFA',
          secondary: '#A1A1AA',
          tertiary:  '#71717A',
          muted:     '#3F3F46',
          inverted:  '#09090B',
        },
        problem: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA6A0A',
          dim: 'rgba(249,115,22,0.10)',
          border: 'rgba(249,115,22,0.22)',
          glow: 'rgba(249,115,22,0.18)',
        },
        solution: {
          500: '#10B981',
          dim: 'rgba(16,185,129,0.10)',
          border: 'rgba(16,185,129,0.22)',
          glow: 'rgba(16,185,129,0.15)',
        },
        status: {
          open:      '#F97316',
          exploring: '#3B82F6',
          proposed:  '#8B5CF6',
          exists:    '#06B6D4',
          solved:    '#10B981',
        },
        error: {
          DEFAULT: '#EF4444',
          dim:     'rgba(239,68,68,0.12)',
          border:  'rgba(239,68,68,0.30)',
        },
        warning: '#F59E0B',
        info:    '#3B82F6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', fontWeight: '500' }],
        'xs':  ['11px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.01em' }],
        'sm':  ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'base':['15px', { lineHeight: '24px', fontWeight: '400' }],
        'lg':  ['17px', { lineHeight: '26px', fontWeight: '500', letterSpacing: '-0.01em' }],
        'xl':  ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.03em' }],
        '4xl': ['36px', { lineHeight: '44px', fontWeight: '700', letterSpacing: '-0.03em' }],
        '5xl': ['48px', { lineHeight: '52px', fontWeight: '800', letterSpacing: '-0.04em' }],
        '6xl': ['60px', { lineHeight: '64px', fontWeight: '800', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        xs:  '4px',
        sm:  '6px',
        md:  '10px',
        lg:  '14px',
        xl:  '20px',
        '2xl': '28px',
        full: '9999px',
      },
      keyframes: {
        'upvote-bounce': {
          '0%':   { transform: 'scale(1)' },
          '30%':  { transform: 'scale(0.85)' },
          '60%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-bottom': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'upvote-bounce': 'upvote-bounce 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        shimmer:         'shimmer 1.5s infinite linear',
        'fade-up':       'fade-up 0.2s ease-out forwards',
        'fade-in':       'fade-in 0.2s ease-out forwards',
        'slide-in-right':'slide-in-right 0.2s ease-out forwards',
        'slide-in-bottom':'slide-in-bottom 0.2s ease-out forwards',
      },
      boxShadow: {
        'card':    '0 1px 2px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.09)',
        'dropdown':'0 4px 12px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.15)',
        'modal':   '0 8px 32px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.15)',
        'focus':   '0 0 0 2px rgba(249,115,22,0.50)',
        'voted':   '0 0 20px rgba(249,115,22,0.20), 0 0 0 1px rgba(249,115,22,0.22)',
        'solved':  '0 0 20px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.22)',
      },
      maxWidth: {
        feed: '680px',
      },
      width: {
        sidebar:      '240px',
        'sidebar-right': '300px',
      },
    },
  },
  plugins: [],
} satisfies Config;
