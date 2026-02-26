import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#050510',
          navy: '#0a0f1e',
          dark: '#0f172a',
          steel: '#1e3a5f',
          cyan: '#0ea5e9',
          'cyan-light': '#38bdf8',
          ice: '#7dd3fc',
          blue: '#2563eb',
        },
      },
    },
  },
  plugins: [typography],
}

export default config
