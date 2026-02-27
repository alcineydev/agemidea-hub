'use client'

import { toMediaUrl } from '@/lib/media-url'
import type { MediaFile } from '../types'

interface MediaRowProps {
  file: MediaFile
  selected: boolean
  onSelect: (id: string) => void
  onOpenDetail: (file: MediaFile) => void
}

export default function MediaRow({ file, selected, onSelect, onOpenDetail }: MediaRowProps) {
  const isImage = file.type.startsWith('image/') && file.type !== 'image/svg+xml'
  const previewUrl = toMediaUrl(file.public_url)

  return (
    <tr
      onClick={() => onOpenDetail(file)}
      className={`border-b border-[#1e3a5f]/30 hover:bg-[#1a2236] cursor-pointer ${selected ? 'bg-cyan-500/5' : ''}`}
    >
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={selected}
          onClick={(event) => event.stopPropagation()}
          onChange={() => onSelect(file.id)}
          className="w-4 h-4 rounded border-[#1e3a5f] bg-transparent"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg border border-[#1e3a5f] bg-[#0a0f1e] flex items-center justify-center overflow-hidden">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#64748b]" strokeWidth="1.7">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm text-white">{file.name}</p>
            <p className="text-xs text-[#64748b]">{file.folder || 'raiz'}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-[#94a3b8]">{file.type}</td>
      <td className="px-3 py-2 text-sm text-[#94a3b8]">{formatBytes(file.size)}</td>
      <td className="px-3 py-2 text-sm text-[#94a3b8]">{formatDate(file.created_at)}</td>
    </tr>
  )
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('pt-BR')
}
