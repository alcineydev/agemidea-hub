'use client'

import { useMediaPicker } from '@/components/media/useMediaPicker'
import type { QuoteSettings } from '@/types/quotes'
import QuotePdfPreview from './QuotePdfPreview'

interface SettingsLayoutTabProps {
  values: Partial<QuoteSettings>
  onChange: <K extends keyof QuoteSettings>(key: K, value: QuoteSettings[K]) => void
}

export default function SettingsLayoutTab({ values, onChange }: SettingsLayoutTabProps) {
  const { openPicker, PickerModal } = useMediaPicker({
    accept: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    title: 'Selecionar logo do orcamento',
  })

  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40'

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-4 rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
        <h3 className="text-sm font-semibold text-white">Layout do PDF</h3>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Logo</span>
          <div className="flex gap-2">
            <input
              value={values.logo_url ?? ''}
              onChange={(event) => onChange('logo_url', event.target.value)}
              className={inputClass}
              placeholder="URL da logo"
            />
            <button
              type="button"
              onClick={async () => {
                const selected = await openPicker()
                if (selected?.mediaUrl) onChange('logo_url', selected.mediaUrl)
              }}
              className="rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-300"
            >
              Midia
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Posicao da logo</span>
            <select
              value={values.logo_position ?? 'left'}
              onChange={(event) =>
                onChange('logo_position', event.target.value as QuoteSettings['logo_position'])
              }
              className={inputClass}
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Tamanho da logo</span>
            <select
              value={values.logo_size ?? 'medium'}
              onChange={(event) => onChange('logo_size', event.target.value as QuoteSettings['logo_size'])}
              className={inputClass}
            >
              <option value="small">Pequeno</option>
              <option value="medium">Medio</option>
              <option value="large">Grande</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Cor primaria</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={values.primary_color ?? '#0ea5e9'}
                onChange={(event) => onChange('primary_color', event.target.value)}
                className="h-10 w-12 rounded-lg border border-[#1e3a5f]/30 bg-transparent"
              />
              <input
                value={values.primary_color ?? '#0ea5e9'}
                onChange={(event) => onChange('primary_color', event.target.value)}
                className={inputClass}
              />
            </div>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Cor do texto</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={values.text_color ?? '#1e293b'}
                onChange={(event) => onChange('text_color', event.target.value)}
                className="h-10 w-12 rounded-lg border border-[#1e3a5f]/30 bg-transparent"
              />
              <input
                value={values.text_color ?? '#1e293b'}
                onChange={(event) => onChange('text_color', event.target.value)}
                className={inputClass}
              />
            </div>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Cor de fundo</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={values.bg_color ?? '#ffffff'}
                onChange={(event) => onChange('bg_color', event.target.value)}
                className="h-10 w-12 rounded-lg border border-[#1e3a5f]/30 bg-transparent"
              />
              <input
                value={values.bg_color ?? '#ffffff'}
                onChange={(event) => onChange('bg_color', event.target.value)}
                className={inputClass}
              />
            </div>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-500">Rodape</span>
          <textarea
            value={values.footer_text ?? ''}
            onChange={(event) => onChange('footer_text', event.target.value)}
            className={`${inputClass} min-h-24`}
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={values.show_page_number ?? true}
            onChange={(event) => onChange('show_page_number', event.target.checked)}
            className="h-4 w-4 rounded border border-[#1e3a5f]/30 bg-[#050510]/60"
          />
          Mostrar numero da pagina
        </label>
      </section>

      <QuotePdfPreview settings={values} />
      {PickerModal}
    </div>
  )
}
