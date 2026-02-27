'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { toAbsoluteMediaUrl, toMediaUrl } from '@/lib/media-url'
import { getMediaMetadata, saveMediaMetadata } from '../actions'
import type { MediaFile } from '../types'

interface DetailPanelProps {
  file: MediaFile | null
  open: boolean
  onClose: () => void
  onDelete: (paths: string[]) => Promise<void>
}

export default function DetailPanel({ file, open, onClose, onDelete }: DetailPanelProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [seo, setSeo] = useState({
    alt_text: '',
    title: '',
    description: '',
    caption: '',
  })
  const [isLoadingSeo, setIsLoadingSeo] = useState(false)
  const [isSavingSeo, setIsSavingSeo] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (!open) return

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !file) return

    const run = async () => {
      setIsLoadingSeo(true)
      try {
        const data = await getMediaMetadata(file.path)
        setSeo({
          alt_text: data?.alt_text ?? '',
          title: data?.title ?? '',
          description: data?.description ?? '',
          caption: data?.caption ?? '',
        })
      } catch {
        toast.error('Não foi possível carregar os dados de SEO.')
      } finally {
        setIsLoadingSeo(false)
      }
    }

    void run()
  }, [file, open])

  useEffect(() => {
    if (!file) {
      setDimensions(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setDimensions(null)
      return
    }

    const metadataWidth = file.metadata?.width
    const metadataHeight = file.metadata?.height
    if (metadataWidth && metadataHeight) {
      setDimensions({ width: metadataWidth, height: metadataHeight })
      return
    }

    setDimensions(null)
    const img = new Image()
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => setDimensions(null)
    img.src = file.public_url

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [file])

  if (!open || !file) return null

  const isImage = file.type.startsWith('image/') && file.type !== 'image/svg+xml'
  const previewUrl = toMediaUrl(file.public_url)
  const displayUrl = toAbsoluteMediaUrl(file.public_url)

  const handleSaveSeo = async () => {
    setIsSavingSeo(true)
    try {
      const response = await saveMediaMetadata({
        storage_path: file.path,
        bucket: file.bucket,
        alt_text: seo.alt_text.slice(0, 125),
        title: seo.title,
        description: seo.description,
        caption: seo.caption,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        width: dimensions?.width ?? file.metadata?.width,
        height: dimensions?.height ?? file.metadata?.height,
      })

      if ('error' in response) {
        toast.error(response.error)
        return
      }

      toast.success('SEO salvo com sucesso.')
    } catch {
      toast.error('Erro ao salvar dados de SEO.')
    } finally {
      setIsSavingSeo(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-black/60" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-[130] h-screen w-full max-w-[420px] bg-[#0a0f1e] border-l border-[#1e3a5f] p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Detalhes do arquivo</h3>
          <button type="button" onClick={onClose} className="text-[#64748b] hover:text-white">
            Fechar
          </button>
        </div>

        <div className="rounded-xl border border-[#1e3a5f] bg-[#111827] h-[240px] flex items-center justify-center overflow-hidden">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={file.name} className="w-full h-full object-contain" />
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#64748b]" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
        </div>

        <div className="space-y-2 mt-4 text-sm">
          <Info label="Nome" value={file.name} />
          <Info label="Tipo" value={file.type} />
          <Info label="Tamanho" value={formatBytes(file.size)} />
          {file.type.startsWith('image/') && (
            <Info
              label="Dimensões"
              value={dimensions ? `${dimensions.width} × ${dimensions.height} px` : 'Carregando...'}
            />
          )}
          <Info label="Enviado em" value={formatDateTime(file.created_at)} />
        </div>

        <div className="space-y-3 mt-5">
          <CopyField label="URL" value={displayUrl} />
          <CopyField label="ID / Path" value={file.path} />
        </div>

        <div className="mt-6 border-t border-[#1e3a5f] pt-4">
          <div className="text-[#0ea5e9] text-xs font-semibold tracking-wider mb-3">SEO DA IMAGEM</div>
          {isLoadingSeo ? (
            <div className="text-sm text-[#64748b]">Carregando dados SEO...</div>
          ) : (
            <div className="space-y-3">
              <SeoField label="Texto alternativo (alt)">
                <input
                  aria-label="Texto alternativo"
                  value={seo.alt_text}
                  maxLength={125}
                  onChange={(event) => setSeo((prev) => ({ ...prev, alt_text: event.target.value.slice(0, 125) }))}
                  className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                />
                <div className="text-[10px] text-[#64748b] text-right">{seo.alt_text.length}/125</div>
              </SeoField>

              <SeoField label="Título (title)">
                <input
                  aria-label="Título"
                  value={seo.title}
                  onChange={(event) => setSeo((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                />
              </SeoField>

              <SeoField label="Descrição">
                <textarea
                  aria-label="Descrição"
                  value={seo.description}
                  rows={2}
                  onChange={(event) => setSeo((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                />
              </SeoField>

              <SeoField label="Legenda">
                <input
                  aria-label="Legenda"
                  value={seo.caption}
                  onChange={(event) => setSeo((prev) => ({ ...prev, caption: event.target.value }))}
                  className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                />
              </SeoField>

              <button
                type="button"
                onClick={() => void handleSaveSeo()}
                disabled={isSavingSeo}
                className="w-full px-3 py-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-[#0ea5e9] hover:border-cyan-500/40 disabled:opacity-60"
              >
                {isSavingSeo ? 'Salvando...' : 'Salvar SEO'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => void copyText(displayUrl, 'URL copiada.')}
            className="flex-1 px-3 py-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-[#0ea5e9] hover:border-cyan-500/40"
          >
            Copiar URL
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex-1 px-3 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10"
          >
            Excluir
          </button>
        </div>
      </aside>

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          void onDelete([file.path])
          setDeleteOpen(false)
          onClose()
        }}
        items={[{ id: file.id, name: file.name }]}
      />
    </>
  )
}

function SeoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#1e3a5f] bg-[#111827] px-3 py-2">
      <div className="text-xs text-[#64748b]">{label}</div>
      <div className="text-[#94a3b8] break-all">{value}</div>
    </div>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#1e3a5f] bg-[#111827] overflow-hidden">
      <div className="px-3 py-2 text-xs text-[#64748b] border-b border-[#1e3a5f]">{label}</div>
      <div className="flex items-center">
        <input aria-label={label} readOnly value={value} className="flex-1 bg-transparent px-3 py-2 text-sm text-[#94a3b8] outline-none" />
        <button
          type="button"
          onClick={() => void copyText(value, `${label} copiado.`)}
          className="px-3 py-2 text-xs text-[#94a3b8] border-l border-[#1e3a5f] hover:text-[#0ea5e9]"
        >
          Copiar
        </button>
      </div>
    </div>
  )
}

async function copyText(value: string, message: string) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const input = document.createElement('textarea')
    input.value = value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
  toast.success(message)
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDateTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR')
}
