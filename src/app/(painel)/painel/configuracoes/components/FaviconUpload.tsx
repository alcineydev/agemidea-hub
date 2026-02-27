'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { removeSiteImage, uploadSiteImage } from '../actions'

interface Props {
  faviconUrl: string
  onUpdate: (url: string) => void
}

export default function FaviconUpload({ faviconUrl, onUpdate }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 2MB.')
      return
    }

    const validTypes = ['image/png', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PNG, SVG ou ICO.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'favicon')
      const result = await uploadSiteImage(formData)
      onUpdate(result.url)
      toast.success('Favicon enviada com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro no upload da favicon.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      await removeSiteImage('favicon')
      onUpdate('')
      toast.success('Favicon removida.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover favicon.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative w-20 h-20 rounded-xl border border-[rgba(30,58,95,.35)] bg-[rgba(15,23,42,.6)] flex items-center justify-center overflow-hidden">
        {faviconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-3" />
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
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/png,image/svg+xml,image/x-icon,image/ico"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="border-2 border-dashed border-[rgba(30,58,95,.4)] rounded-2xl p-4 hover:border-cyan-500 transition-colors">
        <p className="text-sm text-slate-500 mb-3">Recomendado 512x512px, PNG ou SVG, formato quadrado.</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 rounded-lg border border-[rgba(30,58,95,.35)] text-slate-300 text-sm hover:text-cyan-400 hover:border-cyan-500/40 disabled:opacity-50"
          >
            Enviar imagem
          </button>
          {faviconUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 disabled:opacity-50"
            >
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
