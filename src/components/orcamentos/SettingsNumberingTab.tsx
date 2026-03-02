'use client'

import type { QuoteSettings } from '@/types/quotes'

interface SettingsNumberingTabProps {
  values: Partial<QuoteSettings>
  onChange: <K extends keyof QuoteSettings>(key: K, value: QuoteSettings[K]) => void
}

function buildPreview(values: Partial<QuoteSettings>) {
  const prefix = values.prefix || 'ORC'
  const separator = values.separator || '-'
  const seqDigits = values.sequential_digits || 3
  const seq = String(values.next_number || 1).padStart(seqDigits, '0')
  const year = new Date().getFullYear().toString()
  const shortYear = year.slice(2)
  const includeYear = values.include_year ?? true
  const yearPart = values.year_digits === 2 ? shortYear : year

  if (includeYear) return `${prefix}${separator}${yearPart}${separator}${seq}`
  return `${prefix}${separator}${seq}`
}

export default function SettingsNumberingTab({ values, onChange }: SettingsNumberingTabProps) {
  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40'
  const preview = buildPreview(values)
  const includeYearMode = values.include_year
    ? values.year_digits === 2
      ? '2'
      : '4'
    : '0'

  return (
    <section className="space-y-4 rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <h3 className="text-sm font-semibold text-white">Numeracao</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Prefixo</span>
          <input
            value={values.prefix ?? 'ORC'}
            onChange={(event) => onChange('prefix', event.target.value)}
            className={inputClass}
            maxLength={10}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Separador</span>
          <select
            value={values.separator ?? '-'}
            onChange={(event) => onChange('separator', event.target.value)}
            className={inputClass}
          >
            <option value="-">Hifen (-)</option>
            <option value="/">Barra (/)</option>
            <option value=".">Ponto (.)</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Incluir ano</span>
          <select
            value={includeYearMode}
            onChange={(event) => {
              if (event.target.value === '0') {
                onChange('include_year', false)
                onChange('year_digits', 4)
              } else {
                onChange('include_year', true)
                onChange('year_digits', Number(event.target.value) as 2 | 4)
              }
            }}
            className={inputClass}
          >
            <option value="4">Sim (4 digitos)</option>
            <option value="2">Sim (2 digitos)</option>
            <option value="0">Nao</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Digitos sequenciais</span>
          <input
            type="number"
            min={1}
            max={6}
            value={values.sequential_digits ?? 3}
            onChange={(event) =>
              onChange('sequential_digits', Math.max(1, Math.min(6, Number(event.target.value) || 1)))
            }
            className={inputClass}
          />
        </label>
      </div>

      <div className="rounded-lg border border-[#1e3a5f]/20 bg-[#050510]/40 p-3">
        <p className="text-xs font-semibold text-slate-500">Preview</p>
        <p className="mt-1 text-lg font-bold text-cyan-300">{preview}</p>
        <p className="mt-1 text-xs text-slate-500">
          Proximo numero disponivel: {values.next_number ?? 1}
        </p>
      </div>
    </section>
  )
}
