'use client'

import type { SettingsMap } from '../types'
import LogoImageMode from './LogoImageMode'
import LogoTextMode from './LogoTextMode'

interface Props {
  settings: SettingsMap
  onUpdate: (key: string, value: string) => void
  onUpdateMultiple: (updates: Record<string, string>) => void
}

export default function LogoEditor({ settings, onUpdate, onUpdateMultiple }: Props) {
  const logoType = settings.logo_type === 'text' ? 'text' : 'image'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Modo da logo</div>
        <span
          className={`text-[11px] px-2 py-1 rounded-md font-semibold ${
            logoType === 'image' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
          }`}
        >
          {logoType === 'image' ? 'Imagem' : 'Texto'}
        </span>
      </div>

      <div className="inline-flex rounded-lg border border-[rgba(30,58,95,.35)] p-1 bg-[rgba(15,23,42,.8)]">
        <button
          type="button"
          onClick={() => onUpdate('logo_type', 'image')}
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            logoType === 'image' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Imagem
        </button>
        <button
          type="button"
          onClick={() => onUpdate('logo_type', 'text')}
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            logoType === 'text' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Texto
        </button>
      </div>

      {logoType === 'image' ? (
        <LogoImageMode
          logoImageUrl={settings.logo_image_url || ''}
          logoImageId={settings.logo_image_id || ''}
          onUpdateMultiple={onUpdateMultiple}
        />
      ) : (
        <LogoTextMode
          logoText={settings.logo_text || 'AGEMIDEA'}
          logoFont={settings.logo_font || 'Inter'}
          logoSize={settings.logo_size || '36'}
          logoColor={settings.logo_color || '#0ea5e9'}
          logoWeight={settings.logo_weight || '800'}
          logoSpacing={settings.logo_spacing || '-0.02em'}
          onUpdate={onUpdate}
        />
      )}
    </div>
  )
}
