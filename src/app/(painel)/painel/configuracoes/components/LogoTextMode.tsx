'use client'

import { useState } from 'react'

import type { PreviewTheme } from '../types'
import ThemeSwitcher from './ThemeSwitcher'

interface Props {
  logoText: string
  logoFont: string
  logoSize: string
  logoColor: string
  logoWeight: string
  logoSpacing: string
  onUpdate: (key: string, value: string) => void
}

const FONT_OPTIONS = ['Inter', 'Montserrat', 'Poppins', 'Outfit', 'Plus Jakarta Sans', 'Space Grotesk', 'DM Sans']

const WEIGHT_OPTIONS = [
  { value: '400', label: '400 Regular' },
  { value: '500', label: '500 Medium' },
  { value: '600', label: '600 Semibold' },
  { value: '700', label: '700 Bold' },
  { value: '800', label: '800 Extrabold' },
  { value: '900', label: '900 Black' },
]

export default function LogoTextMode({
  logoText,
  logoFont,
  logoSize,
  logoColor,
  logoWeight,
  logoSpacing,
  onUpdate,
}: Props) {
  const [theme, setTheme] = useState<PreviewTheme>('dark')

  return (
    <div className="space-y-4">
      <div
        className={`relative border border-[rgba(30,58,95,.25)] rounded-2xl p-8 min-h-[170px] flex items-center justify-center ${
          theme === 'dark' ? 'bg-[#050510]' : 'bg-white'
        }`}
      >
        <ThemeSwitcher theme={theme} onChange={setTheme} />
        <span
          style={{
            fontFamily: logoFont || 'Inter',
            fontSize: `${Number(logoSize || 36)}px`,
            fontWeight: Number(logoWeight || 800),
            letterSpacing: logoSpacing || '-0.02em',
          }}
          className={
            theme === 'dark'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent'
          }
        >
          {logoText || 'AGEMIDEA'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-slate-300 space-y-2">
          <span className="block text-slate-400">Texto da Logo</span>
          <input
            value={logoText}
            onChange={(event) => onUpdate('logo_text', event.target.value)}
            className="w-full bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3.5 py-2.5 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none"
          />
        </label>

        <label className="text-sm text-slate-300 space-y-2">
          <span className="block text-slate-400">Fonte</span>
          <select
            value={logoFont}
            onChange={(event) => onUpdate('logo_font', event.target.value)}
            className="w-full bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3.5 py-2.5 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-300 space-y-2">
          <span className="block text-slate-400">Tamanho (px)</span>
          <input
            type="number"
            value={logoSize}
            onChange={(event) => onUpdate('logo_size', event.target.value)}
            className="w-full bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3.5 py-2.5 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none"
          />
        </label>

        <label className="text-sm text-slate-300 space-y-2">
          <span className="block text-slate-400">Cor</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg border border-[rgba(30,58,95,.35)]" style={{ background: logoColor || '#0ea5e9' }} />
            <input
              value={logoColor}
              onChange={(event) => onUpdate('logo_color', event.target.value)}
              className="flex-1 bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3.5 py-2.5 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none"
            />
          </div>
        </label>

        <label className="text-sm text-slate-300 space-y-2">
          <span className="block text-slate-400">Peso (font-weight)</span>
          <select
            value={logoWeight}
            onChange={(event) => onUpdate('logo_weight', event.target.value)}
            className="w-full bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3.5 py-2.5 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none"
          >
            {WEIGHT_OPTIONS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-300 space-y-2">
          <span className="block text-slate-400">Espaçamento (letter-spacing)</span>
          <input
            value={logoSpacing}
            onChange={(event) => onUpdate('logo_spacing', event.target.value)}
            className="w-full bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3.5 py-2.5 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none"
          />
        </label>
      </div>
    </div>
  )
}
