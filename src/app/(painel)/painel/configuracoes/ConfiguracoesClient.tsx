'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { saveSettings } from './actions'
import type { SettingsMap } from './types'
import type { ValidationError } from './utils/validation'
import { validateSettings } from './utils/validation'
import CompanyInfoTab from './components/CompanyInfoTab'
import SettingsTabs from './components/SettingsTabs'
import VisualIdentityTab from './components/VisualIdentityTab'

interface Props {
  initialSettings: SettingsMap
}

export default function ConfiguracoesClient({ initialSettings }: Props) {
  const searchParams = useSearchParams()
  const initialTab = useMemo(
    () => (searchParams.get('tab') === 'empresa' ? 'empresa' : 'visual'),
    [searchParams]
  )
  const [settings, setSettings] = useState<SettingsMap>(initialSettings)
  const [activeTab, setActiveTab] = useState<'visual' | 'empresa'>(initialTab)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => prev.filter((error) => error.field !== key))
  }

  const updateMultiple = (updates: Record<string, string>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
    setErrors((prev) => prev.filter((error) => !(error.field in updates)))
  }

  const handleSave = () => {
    const validationErrors = validateSettings(settings)
    setErrors(validationErrors)

    if (validationErrors.length > 0) {
      const firstErrorField = document.querySelector(
        `[data-field="${validationErrors[0].field}"]`
      )
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error('Corrija os campos inválidos antes de salvar.')
      return
    }

    startTransition(async () => {
      try {
        await saveSettings(settings)
        setErrors([])
        setSaved(true)
        toast.success('Configurações salvas com sucesso.')
        setTimeout(() => setSaved(false), 2500)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao salvar configurações.')
      }
    })
  }

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-[rgba(30,58,95,.2)] bg-[rgba(5,5,16,.4)] backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Painel</span>
          <span className="opacity-40">/</span>
          <span>Configurações</span>
          <span className="opacity-40">/</span>
          <span className="text-white font-semibold">
            {activeTab === 'visual' ? 'Identidade Visual' : 'Informações da Empresa'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-400">Salvo com sucesso</span>}
          {errors.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.length} {errors.length === 1 ? 'erro' : 'erros'} encontrados
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="px-8 pt-7">
        <h1 className="text-[22px] font-bold text-white">Configurações</h1>
        <p className="text-sm text-slate-500">Gerencie a identidade visual e informações da empresa.</p>
      </div>

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="px-8 py-7 w-full">
        {activeTab === 'visual' && (
          <VisualIdentityTab settings={settings} onUpdate={updateSetting} onUpdateMultiple={updateMultiple} />
        )}
        {activeTab === 'empresa' && (
          <CompanyInfoTab settings={settings} onUpdate={updateSetting} errors={errors} />
        )}
      </div>
    </div>
  )
}
