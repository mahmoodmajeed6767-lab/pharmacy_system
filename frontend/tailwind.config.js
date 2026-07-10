/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#0f172a',
          hover: '#1e293b',
          active: '#1a5c7a',
          text: '#94a3b8',
          'text-active': '#ffffff',
        },
        accent: {
          DEFAULT: '#1a5c7a',
          light: '#e8f0fe',
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
