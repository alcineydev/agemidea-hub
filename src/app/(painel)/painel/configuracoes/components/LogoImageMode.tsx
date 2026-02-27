'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { removeSiteImage, uploadSiteImage } from '../actions'
import type { PreviewTheme } from '../types'
import CopyField from './CopyField'
import ImageUpload from './ImageUpload'
import ThemeSwitcher from './ThemeSwitcher'

interface Props {
  logoImageUrl: string
  logoImageId: string
  onUpdateMultiple: (updates: Record<string, string>) => void
}

export default function LogoImageMode({ logoImageUrl, logoImageId, onUpdateMultiple }: Props) {
  const [theme, setTheme] = useState<PreviewTheme>('dark')
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB.')
      return
    }

    const validTypes = ['image/png', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PNG, SVG ou WEBP.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'logo')
      const result = await uploadSiteImage(formData)
      onUpdateMultiple({
        logo_image_url: result.url,
        logo_image_id: result.id,
      })
      toast.success('Logo enviada com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro no upload da logo.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    try {
      await removeSiteImage('logo')
      onUpdateMultiple({
        logo_image_url: '',
        logo_image_id: '',
      })
      toast.success('Logo removida.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover logo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border border-[rgba(30,58,95,.25)] rounded-2xl p-8 min-h-[170px] flex items-center justify-center ${
          theme === 'dark' ? 'bg-[#050510]' : 'bg-white'
        }`}
      >
        <ThemeSwitcher theme={theme} onChange={setTheme} />
        {logoImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoImageUrl} alt="Preview da logo" className="max-h-[80px] object-contain" />
        ) : (
          <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-sm`}>
            Preview da logo
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-4 items-start">
        <div className="w-[180px] h-[80px] rounded-xl border border-[rgba(30,58,95,.35)] bg-[rgba(15,23,42,.6)] flex items-center justify-center overflow-hidden">
          {logoImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoImageUrl} alt="Logo atual" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-slate-500">180x80</span>
          )}
        </div>

        <ImageUpload
          label="Enviar logo"
          accept=".png,.svg,.webp,image/png,image/svg+xml,image/webp"
          helperText="Envie sua logo em formato horizontal. Recomendado 400x120px, PNG/SVG, fundo transparente."
          onUpload={handleUpload}
          onRemove={logoImageUrl ? handleRemove : undefined}
          removingLabel="Remover"
        />
      </div>

      {logoImageUrl && (
        <div className="flex flex-col md:flex-row gap-3">
          <CopyField label="URL" value={logoImageUrl} />
          <CopyField label="ID" value={logoImageId} />
        </div>
      )}
    </div>
  )
}
