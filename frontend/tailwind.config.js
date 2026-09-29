/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saha: {
          navy: '#0f2942',
          navyDark: '#0b2035',
          navyLight: '#183857',
          bg: '#f3f6fa',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#0f172a',
          textMuted: '#64748b',
          accent: '#2563eb',
          accentHover: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
