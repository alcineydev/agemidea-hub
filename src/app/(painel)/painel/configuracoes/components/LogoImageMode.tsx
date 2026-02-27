'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { useMediaPicker } from '@/components/media'
import { toMediaUrl } from '@/lib/media-url'
import type { PreviewTheme } from '../types'
import CopyField from './CopyField'
import ThemeSwitcher from './ThemeSwitcher'

interface Props {
  logoImageUrl: string
  logoImageId: string
  onUpdateMultiple: (updates: Record<string, string>) => void
}

export default function LogoImageMode({ logoImageUrl, logoImageId, onUpdateMultiple }: Props) {
  const [theme, setTheme] = useState<PreviewTheme>('dark')
  const { openPicker, PickerModal } = useMediaPicker({
    accept: ['image/png', 'image/svg+xml', 'image/webp'],
    title: 'Escolher Logo',
  })

  const handleChoose = async () => {
    const file = await openPicker()
    if (!file) return

    onUpdateMultiple({
      logo_image_url: file.url,
      logo_image_id: file.path,
    })
    toast.success('Logo selecionada com sucesso.')
  }

  const handleRemove = () => {
    onUpdateMultiple({
      logo_image_url: '',
      logo_image_id: '',
    })
    toast.success('Logo removida.')
  }

  const previewUrl = toMediaUrl(logoImageUrl)

  return (
    <div className="space-y-4">
      <div
        className={`relative border border-[rgba(30,58,95,.25)] rounded-2xl p-8 min-h-[170px] flex items-center justify-center ${
          theme === 'dark' ? 'bg-[#050510]' : 'bg-white'
        }`}
      >
        <ThemeSwitcher theme={theme} onChange={setTheme} />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Preview da logo" className="max-h-[80px] object-contain" />
        ) : (
          <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-sm`}>
            Preview da logo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-4 items-start">
        <div className="w-[180px] h-[80px] rounded-xl border border-[rgba(30,58,95,.35)] bg-[rgba(15,23,42,.6)] flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Logo atual" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-slate-500">180x80</span>
          )}
        </div>

        <div className="border-2 border-dashed border-[rgba(30,58,95,.4)] rounded-2xl p-4 hover:border-cyan-500 transition-colors">
          <p className="text-sm text-slate-500 mb-3">Envie sua logo em formato horizontal. Recomendado 400x120px, PNG/SVG, fundo transparente.</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleChoose()}
              className="px-3 py-2 rounded-lg border border-[rgba(30,58,95,.35)] text-slate-300 text-sm hover:text-cyan-400 hover:border-cyan-500/40"
            >
              Escolher logo
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      </div>

      {previewUrl && (
        <div className="flex flex-col md:flex-row gap-3">
          <CopyField label="URL" value={logoImageUrl} />
          <CopyField label="ID" value={logoImageId} />
        </div>
      )}
      <PickerModal />
    </div>
  )
}
