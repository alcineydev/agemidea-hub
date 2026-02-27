'use client'

import { useRef, useState } from 'react'

interface Props {
  label: string
  accept: string
  helperText: string
  onUpload: (file: File) => Promise<void>
  onRemove?: () => Promise<void>
  removingLabel?: string
}

export default function ImageUpload({
  label,
  accept,
  helperText,
  onUpload,
  onRemove,
  removingLabel = 'Remover',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      await onUpload(file)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return
    setIsRemoving(true)
    try {
      await onRemove()
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-[rgba(30,58,95,.4)] rounded-2xl p-4 hover:border-cyan-500 transition-colors">
        <p className="text-sm text-slate-500 mb-3">{helperText}</p>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-2 rounded-lg border border-[rgba(30,58,95,.35)] text-slate-300 text-sm hover:text-cyan-400 hover:border-cyan-500/40 disabled:opacity-50"
          >
            {isUploading ? 'Enviando...' : label}
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 disabled:opacity-50"
            >
              {isRemoving ? 'Removendo...' : removingLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
