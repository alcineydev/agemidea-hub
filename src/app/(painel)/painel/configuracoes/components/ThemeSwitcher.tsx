'use client'

import type { PreviewTheme } from '../types'

interface Props {
  theme: PreviewTheme
  onChange: (theme: PreviewTheme) => void
}

export default function ThemeSwitcher({ theme, onChange }: Props) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onChange('dark')}
        className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all ${
          theme === 'dark'
            ? 'border-[#0ea5e9] bg-[rgba(14,165,233,0.1)] text-[#0ea5e9]'
            : 'border-[#1e3a5f] bg-[#1a2236] text-slate-500 hover:text-slate-300'
        }`}
        title="Fundo escuro"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange('light')}
        className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all ${
          theme === 'light'
            ? 'border-[#0ea5e9] bg-[rgba(14,165,233,0.1)] text-[#0ea5e9]'
            : 'border-[#1e3a5f] bg-[#1a2236] text-slate-500 hover:text-slate-300'
        }`}
        title="Fundo claro"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </button>
    </div>
  )
}
