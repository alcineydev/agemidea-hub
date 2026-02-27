'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { saveMediaMetadata, uploadMediaFiles } from '../actions'

interface UploadZoneProps {
  onUploadComplete: () => Promise<void>
}

const ACCEPTED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/webm',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const validateFiles = (files: File[]) => {
    for (const file of files) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        toast.error(`Tipo não suportado: ${file.name}`)
        return false
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Arquivo acima de 10MB: ${file.name}`)
        return false
      }
    }

    return true
  }

  const performUpload = async (files: File[]) => {
    if (!files.length || isUploading) return
    if (!validateFiles(files)) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))

      const response = await uploadMediaFiles(formData)
      const failed = response.results.filter((item) => item.error)
      const pathByName = new Map(response.results.map((item) => [item.name, item.path]))

      await Promise.all(
        files.map(async (file) => {
          const uploadedPath = pathByName.get(file.name)
          if (!uploadedPath || !file.type.startsWith('image/')) return

          const dimensions = await getImageDimensionsFromFile(file)
          if (!dimensions) return

          await saveMediaMetadata({
            storage_path: uploadedPath,
            width: dimensions.width,
            height: dimensions.height,
            mime_type: file.type,
            size_bytes: file.size,
            original_name: file.name,
          })
        })
      )

      if (failed.length) {
        toast.error(`Falha em ${failed.length} arquivo(s).`)
      } else {
        toast.success(`${response.results.length} arquivo(s) enviados.`)
      }

      await onUploadComplete()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar arquivos.')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        const files = Array.from(event.dataTransfer.files ?? [])
        void performUpload(files)
      }}
      className={`rounded-xl border-2 border-dashed p-6 transition-all ${
        isDragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-[#1e3a5f] bg-[#111827]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        aria-label="Selecionar arquivos"
        multiple
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp,.svg,.gif,.pdf,.mp4,.webm,image/png,image/jpeg,image/webp,image/svg+xml,image/gif,application/pdf,video/mp4,video/webm"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          void performUpload(files)
        }}
      />

      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-white font-medium">Arraste arquivos aqui</div>
        <div className="text-sm text-[#94a3b8] mt-1">ou</div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="mt-3 px-4 py-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-[#0ea5e9] hover:border-cyan-500/40 transition-all disabled:opacity-60"
        >
          {isUploading ? 'Enviando...' : 'Selecionar arquivos'}
        </button>
        {isUploading && <div className="mt-3 w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />}
        <p className="mt-4 text-xs text-[#64748b]">
          Formatos: PNG, JPG, WEBP, SVG, GIF, PDF, MP4, WEBM (máx. 10MB por arquivo)
        </p>
      </div>
    </div>
  )
}

async function getImageDimensionsFromFile(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(objectUrl)
    }

    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  })
}
