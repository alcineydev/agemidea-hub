'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { toast } from 'sonner'

import {
  getMediaMetadataBatch,
  listMediaFiles,
  saveMediaMetadata,
  uploadMediaFiles,
} from '@/app/(painel)/painel/midia/actions'
import type { MediaFile, MediaMetadata } from '@/app/(painel)/painel/midia/types'
import { toMediaUrl } from '@/lib/media-url'

export interface SelectedMedia {
  url: string
  mediaUrl: string
  path: string
  name: string
  type: string
  size: number
  alt_text?: string
  title?: string
}

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (file: SelectedMedia) => void
  accept?: string[]
  maxSize?: number
  title?: string
  allowUpload?: boolean
}

type GalleryFilter = 'all' | 'images' | 'svg' | 'pdf'
type UploadStatus = 'pending' | 'uploading' | 'done' | 'error'

interface UploadItem {
  name: string
  status: UploadStatus
  error?: string
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  accept,
  maxSize = 10 * 1024 * 1024,
  title = 'Selecionar Mídia',
  allowUpload = true,
}: MediaPickerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const skipAutoSaveRef = useRef(true)
  const [tab, setTab] = useState<'gallery' | 'upload'>('gallery')
  const [files, setFiles] = useState<MediaFile[]>([])
  const [metaMap, setMetaMap] = useState<Record<string, MediaMetadata>>({})
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<GalleryFilter>('all')
  const [loading, setLoading] = useState(false)
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [seo, setSeo] = useState({ alt_text: '', title: '', description: '', caption: '' })

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedId) ?? null,
    [files, selectedId]
  )

  const filteredFiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return files.filter((file) => {
      if (accept?.length && !isAcceptedMime(file.type, accept)) return false
      if (normalizedSearch && !file.name.toLowerCase().includes(normalizedSearch)) return false
      if (filter === 'images') return file.type.startsWith('image/') && file.type !== 'image/svg+xml'
      if (filter === 'svg') return file.type === 'image/svg+xml'
      if (filter === 'pdf') return file.type.includes('pdf')
      return true
    })
  }, [accept, files, filter, search])

  const applySeoFromMetadata = useCallback((metadata?: MediaMetadata) => {
    setSeo({
      alt_text: metadata?.alt_text ?? '',
      title: metadata?.title ?? '',
      description: metadata?.description ?? '',
      caption: metadata?.caption ?? '',
    })
  }, [])

  const loadData = useCallback(async (preferredPath?: string) => {
    setLoading(true)
    try {
      const response = await listMediaFiles()
      if (response.error) {
        toast.error(response.error)
        return
      }

      const loadedFiles = response.files as MediaFile[]
      setFiles(loadedFiles)

      const paths = loadedFiles.map((file) => file.path)
      const metadataList = await getMediaMetadataBatch(paths)
      const map: Record<string, MediaMetadata> = {}
      metadataList.forEach((item) => {
        map[item.storage_path] = item
      })
      setMetaMap(map)

      const preferredFile = preferredPath ? loadedFiles.find((file) => file.path === preferredPath) : null
      const first = preferredFile ?? loadedFiles[0] ?? null
      if (first) {
        setSelectedId(first.id)
        applySeoFromMetadata(map[first.path])
      } else {
        setSelectedId('')
        setSeo({ alt_text: '', title: '', description: '', caption: '' })
      }
    } catch {
      toast.error('Erro ao carregar arquivos de mídia.')
    } finally {
      setLoading(false)
    }
  }, [applySeoFromMetadata])

  useEffect(() => {
    if (!isOpen) return

    void loadData()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, loadData, onClose])

  useEffect(() => {
    if (!selectedFile) return

    skipAutoSaveRef.current = true
    applySeoFromMetadata(metaMap[selectedFile.path])
  }, [applySeoFromMetadata, selectedFile, metaMap])

  useEffect(() => {
    if (!isOpen || !selectedFile) return
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false
      return
    }

    const timeout = setTimeout(async () => {
      const response = await saveMediaMetadata({
        storage_path: selectedFile.path,
        bucket: selectedFile.bucket,
        alt_text: seo.alt_text.slice(0, 125),
        title: seo.title,
        description: seo.description,
        caption: seo.caption,
        original_name: selectedFile.name,
        mime_type: selectedFile.type,
        size_bytes: selectedFile.size,
        width: selectedFile.metadata?.width,
        height: selectedFile.metadata?.height,
      })

      if ('error' in response) {
        toast.error(response.error)
        return
      }

      setMetaMap((prev) => ({
        ...prev,
        [selectedFile.path]: {
          ...(prev[selectedFile.path] ?? buildBaseMetadata(selectedFile.path)),
          storage_path: selectedFile.path,
          alt_text: seo.alt_text,
          title: seo.title,
          description: seo.description,
          caption: seo.caption,
          mime_type: selectedFile.type,
          size_bytes: selectedFile.size,
        },
      }))
    }, 1000)

    return () => clearTimeout(timeout)
  }, [isOpen, selectedFile, seo])

  if (!isOpen) return null

  const handleUpload = async (incoming: File[]) => {
    if (!incoming.length) return

    const validFiles = incoming.filter((file) => {
      if (accept?.length && !isAcceptedMime(file.type, accept)) {
        toast.error(`Tipo não permitido: ${file.name}`)
        return false
      }
      if (file.size > maxSize) {
        toast.error(`Arquivo acima do limite: ${file.name}`)
        return false
      }
      return true
    })

    if (!validFiles.length) return

    setUploadItems(validFiles.map((file) => ({ name: file.name, status: 'uploading' })))

    const formData = new FormData()
    validFiles.forEach((file) => formData.append('files', file))

    const response = await uploadMediaFiles(formData)
    const resultMap = new Map(response.results.map((item) => [item.name, item]))

    setUploadItems(
      validFiles.map((file) => {
        const result = resultMap.get(file.name)
        if (result?.error) return { name: file.name, status: 'error', error: result.error }
        return { name: file.name, status: 'done' }
      })
    )

    const firstUploadedPath = response.results.find((item) => item.path && !item.error)?.path
    if (firstUploadedPath) {
      setTab('gallery')
      await loadData(firstUploadedPath)
      toast.success('Upload concluído.')
    }
  }

  const selectedMeta = selectedFile ? metaMap[selectedFile.path] : null

  return (
    <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[900px] bg-[#0a0f1e] sm:rounded-2xl border border-[#1e3a5f] overflow-hidden flex flex-col opacity-100 scale-100 transition-all"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="px-4 py-3 border-b border-[#1e3a5f] flex items-center justify-between">
          <h3 className="text-white font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="text-[#64748b] hover:text-white">✕</button>
        </header>

        <div className="px-4 py-2 border-b border-[#1e3a5f] flex items-center gap-2 text-sm">
          <button type="button" onClick={() => setTab('gallery')} className={tabClass(tab === 'gallery')}>
            📷 Galeria <span className="text-xs">({filteredFiles.length})</span>
          </button>
          {allowUpload && (
            <button type="button" onClick={() => setTab('upload')} className={tabClass(tab === 'upload')}>
              ⬆ Upload
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto">
            {tab === 'gallery' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar arquivo..."
                    className="flex-1 bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                  />
                  <div className="flex gap-1">
                    {(['all', 'images', 'svg', 'pdf'] as GalleryFilter[]).map((value) => (
                      <button key={value} type="button" onClick={() => setFilter(value)} className={chipClass(filter === value)}>
                        {value === 'all' ? 'Todos' : value === 'images' ? 'Imagens' : value.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <p className="text-sm text-[#64748b]">Carregando...</p>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                    {filteredFiles.map((file) => {
                      const isSelected = selectedId === file.id
                      return (
                        <button
                          type="button"
                          key={file.id}
                          onClick={() => setSelectedId(file.id)}
                          className={`relative rounded-lg border bg-[#111827] overflow-hidden ${
                            isSelected ? 'border-cyan-500' : 'border-[#1e3a5f]'
                          }`}
                        >
                          <div className="aspect-square bg-[#0a0f1e] flex items-center justify-center">
                            {file.type.startsWith('image/') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={toMediaUrl(file.public_url)} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-[#94a3b8] px-2 text-center">{file.type}</span>
                            )}
                          </div>
                          {isSelected && <span className="absolute top-1 right-1 text-[10px] bg-cyan-500 text-white px-1 rounded">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <UploadDropZone
                  onSelect={(files) => void handleUpload(files)}
                  disabled={!allowUpload}
                  inputRef={fileInputRef}
                />
                {uploadItems.length > 0 && (
                  <div className="space-y-2">
                    {uploadItems.map((item) => (
                      <div key={item.name} className="rounded-lg border border-[#1e3a5f] bg-[#111827] p-2">
                        <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                          <span className="truncate pr-2">{item.name}</span>
                          <span>{item.status === 'done' ? 'Concluído' : item.status === 'error' ? 'Erro' : 'Enviando...'}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded bg-[#0a0f1e] overflow-hidden">
                          <div
                            className={`h-full ${item.status === 'error' ? 'bg-red-500' : 'bg-cyan-500'} ${item.status === 'uploading' ? 'animate-pulse w-2/3' : 'w-full'}`}
                          />
                        </div>
                        {item.error && <p className="text-[10px] text-red-400 mt-1">{item.error}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          <aside className="hidden lg:block w-[260px] border-l border-[#1e3a5f] p-3 space-y-3 overflow-y-auto">
            {selectedFile ? (
              <>
                <div className="rounded-lg border border-[#1e3a5f] bg-[#111827] aspect-square overflow-hidden flex items-center justify-center">
                  {selectedFile.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={toMediaUrl(selectedFile.public_url)} alt={selectedFile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-[#94a3b8] px-2 text-center">{selectedFile.type}</span>
                  )}
                </div>
                <div className="text-xs text-[#94a3b8] space-y-1">
                  <p className="truncate">{selectedFile.name}</p>
                  <p>{selectedFile.type}</p>
                  <p>{formatBytes(selectedFile.size)}</p>
                </div>
                <div className="border-t border-[#1e3a5f] pt-3 space-y-2">
                  <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Alt ({seo.alt_text.length}/125)</label>
                  <input
                    value={seo.alt_text}
                    maxLength={125}
                    onChange={(event) => setSeo((prev) => ({ ...prev, alt_text: event.target.value.slice(0, 125) }))}
                    className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                  />
                  <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Título</label>
                  <input
                    value={seo.title}
                    onChange={(event) => setSeo((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                  />
                  <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Descrição</label>
                  <textarea
                    rows={2}
                    value={seo.description}
                    onChange={(event) => setSeo((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                  />
                  <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Legenda</label>
                  <input
                    value={seo.caption}
                    onChange={(event) => setSeo((prev) => ({ ...prev, caption: event.target.value }))}
                    className="w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-sm p-2 text-white outline-none focus:border-[#0ea5e9]"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-[#64748b]">Selecione um arquivo.</p>
            )}
          </aside>
        </div>

        <footer className="px-4 py-3 border-t border-[#1e3a5f] flex items-center gap-2">
          <span className="text-xs text-[#94a3b8] truncate">
            {selectedFile ? `Selecionado: ${selectedFile.name}` : 'Nenhum arquivo selecionado'}
          </span>
          <button type="button" onClick={onClose} className="ml-auto px-3 py-1.5 text-sm rounded-lg border border-[#1e3a5f] text-[#94a3b8]">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!selectedFile}
            onClick={() => {
              if (!selectedFile) return
              const metadata = selectedMeta
              onSelect({
                url: selectedFile.public_url,
                mediaUrl: toMediaUrl(selectedFile.public_url),
                path: selectedFile.path,
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                alt_text: metadata?.alt_text || seo.alt_text,
                title: metadata?.title || seo.title,
              })
            }}
            className="px-3 py-1.5 text-sm rounded-lg bg-cyan-500 text-white disabled:opacity-50"
          >
            Selecionar
          </button>
        </footer>
      </div>
    </div>
  )

}

function UploadDropZone({
  onSelect,
  disabled,
  inputRef,
}: {
  onSelect: (files: File[]) => void
  disabled: boolean
  inputRef: RefObject<HTMLInputElement | null>
}) {
  return (
    <div
      className="rounded-xl border-2 border-dashed border-[#1e3a5f] bg-[#111827] p-6 text-center"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        onSelect(Array.from(event.dataTransfer.files ?? []))
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => onSelect(Array.from(event.target.files ?? []))}
      />
      <p className="text-sm text-white">Arraste e solte arquivos aqui</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-3 px-3 py-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-[#0ea5e9] disabled:opacity-50"
      >
        Selecionar arquivos
      </button>
    </div>
  )
}

function tabClass(active: boolean) {
  return `px-3 py-1.5 rounded-lg border text-xs ${active ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-[#1e3a5f] text-[#94a3b8]'}`
}

function chipClass(active: boolean) {
  return `px-2.5 py-1.5 rounded-lg border text-xs ${active ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-[#1e3a5f] text-[#94a3b8]'}`
}

function isAcceptedMime(type: string, accept: string[]) {
  return accept.some((allowed) => {
    if (allowed.endsWith('/*')) return type.startsWith(allowed.replace('/*', '/'))
    return allowed === type
  })
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildBaseMetadata(path: string): MediaMetadata {
  return {
    id: path,
    storage_path: path,
    bucket: 'site-assets',
    alt_text: '',
    title: '',
    description: '',
    caption: '',
    original_name: '',
    mime_type: '',
    size_bytes: 0,
    width: null,
    height: null,
    created_at: '',
    updated_at: '',
  }
}
