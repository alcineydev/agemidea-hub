'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { useMediaPicker } from '@/components/media'
import { toAbsoluteMediaUrl, toMediaUrl } from '@/lib/media-url'
import { saveSetting } from '../actions'
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
    const previousUrl = logoImageUrl
    const previousId = logoImageId

    onUpdateMultiple({
      logo_image_url: file.url,
      logo_image_id: file.path,
    })

    const [urlResult, idResult] = await Promise.all([
      saveSetting('logo_image_url', file.url),
      saveSetting('logo_image_id', file.path),
    ])

    if ('error' in urlResult || 'error' in idResult) {
      onUpdateMultiple({
        logo_image_url: previousUrl,
        logo_image_id: previousId,
      })
      toast.error('Erro ao salvar logo no banco.')
      return
    }

    toast.success('Logo selecionada e salva com sucesso.')
  }

  const handleRemove = async () => {
    const previousUrl = logoImageUrl
    const previousId = logoImageId

    onUpdateMultiple({
      logo_image_url: '',
      logo_image_id: '',
    })

    const [urlResult, idResult] = await Promise.all([
      saveSetting('logo_image_url', ''),
      saveSetting('logo_image_id', ''),
    ])

    if ('error' in urlResult || 'error' in idResult) {
      onUpdateMultiple({
        logo_image_url: previousUrl,
        logo_image_id: previousId,
      })
      toast.error('Erro ao remover logo do banco.')
      return
    }

    toast.success('Logo removida.')
  }

  const previewUrl = toMediaUrl(logoImageUrl)
  const displayUrl = toAbsoluteMediaUrl(logoImageUrl)

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <div className="w-full lg:w-[220px] flex-shrink-0">
          <div
            className={`w-full aspect-[10/3] rounded-xl border border-[#1e3a5f] flex items-center justify-center ${
              theme === 'dark' ? 'bg-[#0a0f1e]' : 'bg-[#f8fafc]'
            }`}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview da logo" className="max-w-[85%] max-h-[80%] object-contain" />
            ) : (
              <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-sm`}>
                Preview da logo
              </span>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <ThemeSwitcher theme={theme} onChange={setTheme} />
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          <p className="text-xs leading-relaxed text-[#64748b]">
            Envie sua logo em formato horizontal. Recomendado 400x120px, PNG/SVG, fundo transparente.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleChoose()}
              className="px-3 py-2 rounded-lg border border-[#1e3a5f] text-slate-300 text-sm hover:text-cyan-400 hover:border-cyan-500/40"
            >
              Escolher Logo
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

          {previewUrl && (
            <div className="space-y-2">
              <CopyField label="URL" value={displayUrl} />
              <CopyField label="ID" value={logoImageId} />
            </div>
          )}
        </div>
      </div>

      {PickerModal}
    </div>
  )
}
