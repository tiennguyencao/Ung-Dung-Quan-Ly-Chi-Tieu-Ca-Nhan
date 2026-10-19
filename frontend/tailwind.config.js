/** @type {import('tailwindcss').Config} */
// Tokens match ui-design-baseline-v1.0.md's design system exactly — extending Tailwind's
// theme (instead of inline styles, which the artifact prototype needed) is what makes
// className="bg-ink text-white" etc. work throughout the real components.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F6F2',
        surface: '#FFFFFF',
        ink: { DEFAULT: '#0E4B3F', light: '#166354' },
        charcoal: '#1D2521',
        muted: '#5C6B62',
        border: '#E1E5DF',
        income: '#0E4B3F',
        expense: '#B23A20',
        // #C17F17 is 3.33:1 on white — fine for the progress-bar fill (graphics
        // need 3:1) but below AA for the small "Near limit" label, which uses dark.
        warn: { DEFAULT: '#C17F17', dark: '#9A6310' },
      },
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        slideUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fadeIn .15s ease-out',
        'scale-in': 'scaleIn .15s ease-out',
        'slide-in': 'slideIn .2s ease-out',
        // Mobile bottom-sheet entrance (Modal.jsx) — desktop keeps scale-in.
        'slide-up': 'slideUp .22s cubic-bezier(0.32,0.72,0,1)',
      },
    },
  },
  plugins: [],
};
