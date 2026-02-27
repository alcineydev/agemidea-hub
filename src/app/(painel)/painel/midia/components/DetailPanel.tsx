'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import type { MediaFile } from '../types'

interface DetailPanelProps {
  file: MediaFile | null
  open: boolean
  onClose: () => void
  onDelete: (paths: string[]) => Promise<void>
}

export default function DetailPanel({ file, open, onClose, onDelete }: DetailPanelProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open || !file) return null

  const isImage = file.type.startsWith('image/') && file.type !== 'image/svg+xml'

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
            <img src={file.public_url} alt={file.name} className="w-full h-full object-contain" />
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
          <Info label="Dimensões" value={file.metadata?.width && file.metadata?.height ? `${file.metadata.width}x${file.metadata.height}` : '-'} />
          <Info label="Enviado em" value={formatDateTime(file.created_at)} />
        </div>

        <div className="space-y-3 mt-5">
          <CopyField label="URL pública" value={file.public_url} />
          <CopyField label="ID / Path" value={file.path} />
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => void copyText(file.public_url, 'URL copiada.')}
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
        <input readOnly value={value} className="flex-1 bg-transparent px-3 py-2 text-sm text-[#94a3b8] outline-none" />
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
