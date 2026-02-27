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
    applyFavicon(file.url)
    toast.success('Favicon selecionada com sucesso.')
  }

  const handleRemove = () => {
    setHasPreviewError(false)
    onUpdate('')
    clearFavicon()
    toast.success('Favicon removida.')
  }

  const previewUrl = toMediaUrl(faviconUrl)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-500" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
        </div>
        <p className="text-sm text-slate-500">Recomendado 512x512px, PNG ou SVG, formato quadrado, fundo transparente.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleChoose()}
          className="px-3 py-2 rounded-lg border border-[rgba(30,58,95,.35)] text-slate-300 text-sm hover:text-cyan-400 hover:border-cyan-500/40"
        >
          Escolher favicon
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
      {PickerModal}
    </div>
  )
}

function clearFavicon() {
  const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
  existingLinks.forEach((link) => link.remove())
}

function applyFavicon(rawUrl: string) {
  clearFavicon()
  const url = toMediaUrl(rawUrl)

  const icon = document.createElement('link')
  icon.rel = 'icon'
  icon.type = rawUrl.includes('.svg') ? 'image/svg+xml' : 'image/png'
  icon.href = url
  document.head.appendChild(icon)

  const apple = document.createElement('link')
  apple.rel = 'apple-touch-icon'
  apple.href = url
  document.head.appendChild(apple)
}
