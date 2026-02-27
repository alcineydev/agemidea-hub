'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { useMediaPicker } from '@/components/media'
import { toMediaUrl } from '@/lib/media-url'

interface Props {
  faviconUrl: string
  onUpdate: (url: string) => void
}

export default function FaviconUpload({ faviconUrl, onUpdate }: Props) {
  const [hasPreviewError, setHasPreviewError] = useState(false)
  const { openPicker, PickerModal } = useMediaPicker({
    accept: ['image/png', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'],
    title: 'Escolher Favicon',
  })

  const handleChoose = async () => {
    const file = await openPicker()
    if (!file) return
    setHasPreviewError(false)
    onUpdate(file.url)
    toast.success('Favicon selecionada com sucesso.')
  }

  const handleRemove = () => {
    setHasPreviewError(false)
    onUpdate('')
    toast.success('Favicon removida.')
  }

  const previewUrl = toMediaUrl(faviconUrl)

  return (
    <div className="space-y-4">
      <div className="relative w-20 h-20 rounded-xl border border-[rgba(30,58,95,.35)] bg-[rgba(15,23,42,.6)] flex items-center justify-center overflow-hidden">
        {previewUrl && !hasPreviewError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Favicon"
            className="w-full h-full object-contain p-3"
            onError={() => setHasPreviewError(true)}
            onLoad={() => setHasPreviewError(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-[11px]">Upload</span>
          </div>
        )}
      </div>

      <div className="border-2 border-dashed border-[rgba(30,58,95,.4)] rounded-2xl p-4 hover:border-cyan-500 transition-colors">
        <p className="text-sm text-slate-500 mb-3">Recomendado 512x512px, PNG ou SVG, formato quadrado, fundo transparente.</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleChoose()}
            className="px-3 py-2 rounded-lg border border-[rgba(30,58,95,.35)] text-slate-300 text-sm hover:text-cyan-400 hover:border-cyan-500/40 disabled:opacity-50"
          >
            Escolher favicon
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 disabled:opacity-50"
            >
              Remover
            </button>
          )}
        </div>
      </div>
      <PickerModal />
    </div>
  )
}
