'use client'

import type { SettingsMap } from '../types'
import FaviconUpload from './FaviconUpload'
import LogoEditor from './LogoEditor'

interface Props {
  settings: SettingsMap
  onUpdate: (key: string, value: string) => void
  onUpdateMultiple: (updates: Record<string, string>) => void
}

const cardClass =
  'bg-[rgba(15,23,42,.6)] border border-[rgba(30,58,95,.25)] rounded-2xl p-7'

export default function VisualIdentityTab({ settings, onUpdate, onUpdateMultiple }: Props) {
  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-white mb-1">Favicon</h2>
        <p className="text-sm text-slate-500 mb-4">Ícone exibido na aba do navegador e favoritos.</p>
        <FaviconUpload
          faviconUrl={settings.favicon_url || ''}
          onUpdate={(value) => onUpdate('favicon_url', value)}
        />
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-white mb-1">Logo</h2>
        <p className="text-sm text-slate-500 mb-4">Configure a logo por imagem ou por texto dinâmico.</p>
        <LogoEditor settings={settings} onUpdate={onUpdate} onUpdateMultiple={onUpdateMultiple} />
      </section>
    </div>
  )
}
