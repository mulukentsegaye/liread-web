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
        vibe: {
          bg: 'var(--vibe-bg)',
          card: 'var(--vibe-card)',
          'card-subtle': 'var(--vibe-card-subtle)',
          'card-hover': 'var(--vibe-card-hover)',
          border: 'var(--vibe-border)',
          'border-subtle': 'var(--vibe-border-subtle)',
          ink: 'var(--vibe-ink)',
          'ink-secondary': 'var(--vibe-ink-secondary)',
          'ink-muted': 'var(--vibe-ink-muted)',
          accent: 'var(--vibe-accent)',
          'accent-hover': 'var(--vibe-accent-hover)',
          'accent-subtle': 'var(--vibe-accent-subtle)',
          secondary: 'var(--vibe-secondary)',
          'secondary-hover': 'var(--vibe-secondary-hover)',
          'secondary-subtle': 'var(--vibe-secondary-subtle)',
          'badge-bg': 'var(--vibe-badge-bg)',
          'badge-text': 'var(--vibe-badge-text)',
        },
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
        },
        alabaster: '#FBFBF9',
        forest: {
          DEFAULT: '#2D6A4F',
          dark: '#22533D',
          light: '#EBF2ED',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Lora', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'soft': 'var(--vibe-shadow, 0 4px 20px -4px rgba(0,0,0,0.05))',
        'float': 'var(--vibe-shadow-elevated, 0 10px 25px -5px rgba(0, 0, 0, 0.08))',
        'vibe': 'var(--vibe-shadow)',
        'vibe-elevated': 'var(--vibe-shadow-elevated)',
        'diffused': '0 4px 20px -4px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
