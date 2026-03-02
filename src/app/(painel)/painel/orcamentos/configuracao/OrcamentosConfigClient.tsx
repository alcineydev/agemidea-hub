'use client'

import { useMemo, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import SettingsCompanyTab from '@/components/orcamentos/SettingsCompanyTab'
import SettingsDefaultsTab from '@/components/orcamentos/SettingsDefaultsTab'
import SettingsLayoutTab from '@/components/orcamentos/SettingsLayoutTab'
import SettingsNumberingTab from '@/components/orcamentos/SettingsNumberingTab'
import { updateQuoteSettings } from '@/app/(painel)/painel/orcamentos/_actions'
import type { PaymentCondition, QuoteSettings } from '@/types/quotes'

type SettingsTab = 'layout' | 'empresa' | 'padroes' | 'numeracao'

interface OrcamentosConfigClientProps {
  initialSettings: QuoteSettings
  paymentConditions: PaymentCondition[]
  siteSettings: Record<string, string>
}

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'layout', label: 'Layout PDF' },
  { id: 'empresa', label: 'Dados da Empresa' },
  { id: 'padroes', label: 'Padroes' },
  { id: 'numeracao', label: 'Numeracao' },
]

export default function OrcamentosConfigClient({
  initialSettings,
  paymentConditions,
  siteSettings,
}: OrcamentosConfigClientProps) {
  const searchParams = useSearchParams()
  const defaultTab = useMemo<SettingsTab>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'empresa' || tab === 'padroes' || tab === 'numeracao') return tab
    return 'layout'
  }, [searchParams])

  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)
  const [values, setValues] = useState<QuoteSettings>(initialSettings)
  const [isPending, startTransition] = useTransition()

  const onChange = <K extends keyof QuoteSettings>(key: K, value: QuoteSettings[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const onSave = () => {
    startTransition(async () => {
      const result = await updateQuoteSettings(values)
      if (result.error) {
        const errorText =
          typeof result.error === 'string'
            ? result.error
            : Object.values(result.error).flat().join(' | ')
        toast.error(errorText || 'Erro ao salvar configuracoes.')
        return
      }
      toast.success('Configuracoes salvas.')
    })
  }

  return (
    <div className="animate-fade-in space-y-4">
      <header className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Configuracao de Orcamentos</h1>
            <p className="text-sm text-slate-500">Layout, dados da empresa, padroes e numeracao.</p>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={isPending}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? 'Salvando...' : 'Salvar alteracoes'}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-1 rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'layout' && <SettingsLayoutTab values={values} onChange={onChange} />}
      {activeTab === 'empresa' && (
        <SettingsCompanyTab values={values} fallbackSettings={siteSettings} onChange={onChange} />
      )}
      {activeTab === 'padroes' && (
        <SettingsDefaultsTab
          values={values}
          paymentConditions={paymentConditions}
          onChange={onChange}
        />
      )}
      {activeTab === 'numeracao' && <SettingsNumberingTab values={values} onChange={onChange} />}
    </div>
  )
}
