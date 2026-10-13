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
        brand: {
          50: '#f2f6f3',
          100: '#e3ebe5',
          200: '#c8d8cc',
          300: '#a3beaa',
          400: '#799e84',
          500: '#568064',
          600: '#41664e',
          700: '#35523f',
          800: '#2c4233',
          900: '#26372c',
          950: '#141e17',
        },
        sage: {
          50: '#f6f8f6',
          100: '#ebf1ec',
          200: '#d7e3da',
          300: '#b8ccbe',
          400: '#94b09c',
          500: '#73947c',
          600: '#5a7863',
          700: '#475f4e',
          800: '#3a4c40',
          900: '#313f36',
        },
        cream: {
          50: '#fdfcf9',
          100: '#f9f7f1',
          200: '#f3efe3',
          300: '#e9e3cf',
          400: '#ded3b6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'float': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
