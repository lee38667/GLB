import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        /* ─── Love Letter Zine palette ─── */
        paper: {
          DEFAULT: '#F2EBDD',
          warm:    '#F7F1E2',
          soft:    '#ECE2CD',
          deep:    '#E2D6BB',
        },
        ink: {
          DEFAULT: '#14110E',
          900:     '#0B0907',
          800:     '#1A1612',
          700:     '#2A241D',
          600:     '#3D3429',
          500:     '#564A3B',
        },
        vermillion: {
          DEFAULT: '#D63A26',
          deep:    '#A82815',
          soft:    '#E66552',
        },
        graphite: '#6B6258',
        sepia:    '#8A7A65',
        rule:     '#1A1612',
        hairline: '#C9BEA7',

        /* ─── Legacy aliases — keep existing pages alive ─── */
        parchment: {
          DEFAULT: '#F2EBDD',
          warm:    '#F7F1E2',
          soft:    '#ECE2CD',
          deep:    '#E2D6BB',
        },
        obsidian: '#14110E',
        stone: {
          DEFAULT: '#6B6258',
          light:   '#8A7A65',
        },
        ivory: {
          DEFAULT: '#14110E',
          warm:    '#1A1612',
          soft:    '#2A241D',
        },
        dune:     '#C9BEA7',
        charcoal: '#E2D6BB',
        ash:      '#C9BEA7',
        sand:     '#14110E',
        clay:     '#6B6258',
        flare:    '#D63A26',
        pulse:    '#8A7A65',
        tide:     '#564A3B',
        line:     '#C9BEA7',
        muted:    '#6B6258',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-serif', 'serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3.5rem, 11vw, 9rem)',  { lineHeight: '0.88', letterSpacing: '-0.025em' }],
        'display-xl':  ['clamp(2.6rem, 7vw, 6rem)',   { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'display-lg':  ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '1.0',  letterSpacing: '-0.012em' }],
      },
      letterSpacing: {
        ultra: '0.42em',
        wide:  '0.24em',
      },
      borderRadius: {
        xs: '0.125rem',
        sm: '0.25rem',
        DEFAULT: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
      },
      backgroundImage: {
        'paper-grain':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        stamp:  '4px 4px 0 0 #14110E',
        stampR: '4px 4px 0 0 #D63A26',
        photo:  '0 22px 40px -18px rgba(20,17,14,0.45)',
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.17, 0.67, 0.36, 0.99)',
      },
      animation: {
        marquee: 'marquee 36s linear infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.17, 0.67, 0.36, 0.99) both',
        'rise':    'rise 0.9s cubic-bezier(0.17, 0.67, 0.36, 0.99) both',
        'wax':     'wax 1.1s ease-out both',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(36px) rotate(-1deg)' },
          to:   { opacity: '1', transform: 'translateY(0) rotate(0)' },
        },
        wax: {
          from: { opacity: '0', transform: 'scale(0.6) rotate(-12deg)' },
          to:   { opacity: '1', transform: 'scale(1) rotate(-6deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
