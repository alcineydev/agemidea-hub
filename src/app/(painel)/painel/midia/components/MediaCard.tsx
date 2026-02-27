'use client'

import { toMediaUrl } from '@/lib/media-url'
import type { MediaFile } from '../types'

interface MediaCardProps {
  file: MediaFile
  selected: boolean
  onSelect: (id: string) => void
  onOpenDetail: (file: MediaFile) => void
}

export default function MediaCard({ file, selected, onSelect, onOpenDetail }: MediaCardProps) {
  const isImage = file.type.startsWith('image/') && file.type !== 'image/svg+xml'
  const isSvg = file.type === 'image/svg+xml'
  const isPdf = file.type.includes('pdf')
  const isVideo = file.type.startsWith('video/')

  const previewUrl = toMediaUrl(file.public_url)

  return (
    <article
      className={`group rounded-xl border bg-[#111827] p-3 transition-all cursor-pointer ${
        selected
          ? 'border-cyan-500/50 shadow-[0_8px_20px_rgba(14,165,233,.15)]'
          : 'border-[#1e3a5f] hover:border-cyan-500/40 hover:-translate-y-0.5'
      }`}
      onClick={() => onOpenDetail(file)}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden border border-[#1e3a5f] bg-[#0a0f1e] flex items-center justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(file.id)}
          onClick={(event) => event.stopPropagation()}
          className={`absolute left-2 top-2 z-10 w-4 h-4 rounded border-[#1e3a5f] bg-[#0a0f1e] ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        />
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#94a3b8]">
            <FileTypeIcon />
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                isSvg
                  ? 'bg-violet-500/15 text-violet-300'
                  : isPdf
                    ? 'bg-red-500/15 text-red-300'
                    : isVideo
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-cyan-500/15 text-cyan-300'
              }`}
            >
              {isSvg ? 'SVG' : isPdf ? 'PDF' : isVideo ? 'MP4' : 'ARQ'}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3">
        <p className="text-sm text-white truncate">{file.name}</p>
        <p className="text-xs text-[#64748b] mt-1">{formatMeta(file)}</p>
      </div>
    </article>
  )
}

function formatMeta(file: MediaFile) {
  if (file.metadata?.width && file.metadata?.height) {
    return `${file.metadata.width}x${file.metadata.height} • ${formatBytes(file.size)}`
  }
  return `${file.type} • ${formatBytes(file.size)}`
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
