/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Sora"', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#f7f5ef',
        surface: '#ffffff',
        'surface-light': '#f0eee7',
        primary: '#0f766e',
        'primary-soft': '#5fc2b8',
        accent: '#f59e0b',
        textPrimary: '#0f172a',
        textSecondary: '#475467',
        border: '#e2e8f0',
      },
      boxShadow: {
        card: '0 14px 40px rgba(15, 118, 110, 0.12)',
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)',
      },
      borderRadius: {
        xl: '18px',
        '2xl': '26px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 300ms ease-out',
        slideIn: 'slideIn 280ms ease-out',
        blob: 'blob 7s infinite',
        bounce: 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
