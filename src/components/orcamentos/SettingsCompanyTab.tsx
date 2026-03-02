'use client'

import type { QuoteSettings } from '@/types/quotes'

interface SettingsCompanyTabProps {
  values: Partial<QuoteSettings>
  fallbackSettings?: Record<string, string>
  onChange: <K extends keyof QuoteSettings>(key: K, value: QuoteSettings[K]) => void
}

export default function SettingsCompanyTab({
  values,
  fallbackSettings,
  onChange,
}: SettingsCompanyTabProps) {
  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40'
  const fallback = fallbackSettings ?? {}

  return (
    <section className="space-y-4 rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Dados da empresa</h3>
        <p className="text-xs text-slate-500">
          Estes dados serao usados no PDF. Se estiver vazio, o sistema usa Configuracoes Gerais.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Razao social</span>
          <input
            value={values.company_name ?? fallback.company_name ?? ''}
            onChange={(event) => onChange('company_name', event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">CNPJ</span>
          <input
            value={values.company_document ?? fallback.company_cnpj ?? ''}
            onChange={(event) => onChange('company_document', event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Email</span>
          <input
            value={values.company_email ?? fallback.email_main ?? ''}
            onChange={(event) => onChange('company_email', event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Telefone</span>
          <input
            value={values.company_phone ?? fallback.phone_whatsapp ?? ''}
            onChange={(event) => onChange('company_phone', event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold text-slate-500">Endereco</span>
          <textarea
            value={values.company_address ?? fallback.address_street ?? ''}
            onChange={(event) => onChange('company_address', event.target.value)}
            className={`${inputClass} min-h-20`}
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold text-slate-500">Website</span>
          <input
            value={values.company_website ?? fallback.site_url ?? ''}
            onChange={(event) => onChange('company_website', event.target.value)}
            className={inputClass}
          />
        </label>
      </div>
    </section>
  )
}
