/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'safety': {
          'bg':       '#0A0F1C',
          'card':     '#111827',
          'sidebar':  '#0D1525',
          'border':   '#1E293B',
          'orange':   '#F97316',
          'orange2':  '#EA6C0A',
          'yellow':   '#FACC15',
          'blue':     '#1E40AF',
          'blue2':    '#1D4ED8',
          'text':     '#F1F5F9',
          'muted':    '#94A3B8',
          'success':  '#22C55E',
          'danger':   '#EF4444',
          'warning':  '#F59E0B',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
