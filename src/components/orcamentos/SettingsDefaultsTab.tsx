'use client'

import type { PaymentCondition, QuoteSettings } from '@/types/quotes'
import PaymentConditionManager from './PaymentConditionManager'

interface SettingsDefaultsTabProps {
  values: Partial<QuoteSettings>
  paymentConditions: PaymentCondition[]
  onChange: <K extends keyof QuoteSettings>(key: K, value: QuoteSettings[K]) => void
}

export default function SettingsDefaultsTab({
  values,
  paymentConditions,
  onChange,
}: SettingsDefaultsTabProps) {
  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40'

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
        <h3 className="text-sm font-semibold text-white">Padroes de texto</h3>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-500">Observacao padrao</span>
          <textarea
            value={values.default_observation ?? ''}
            onChange={(event) => onChange('default_observation', event.target.value)}
            className={`${inputClass} min-h-24`}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-500">Termos padrao</span>
          <textarea
            value={values.default_terms ?? ''}
            onChange={(event) => onChange('default_terms', event.target.value)}
            className={`${inputClass} min-h-28`}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-500">Validade padrao (dias)</span>
          <input
            type="number"
            min={1}
            max={365}
            value={values.default_validity_days ?? 15}
            onChange={(event) => onChange('default_validity_days', Number(event.target.value) || 15)}
            className={inputClass}
          />
        </label>
      </section>

      <PaymentConditionManager initialConditions={paymentConditions} />
    </div>
  )
}
