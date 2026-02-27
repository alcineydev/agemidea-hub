'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { deleteMediaFiles, listMediaFiles } from './actions'
import DetailPanel from './components/DetailPanel'
import MediaGrid from './components/MediaGrid'
import MediaList from './components/MediaList'
import MediaToolbar from './components/MediaToolbar'
import StorageStats from './components/StorageStats'
import UploadZone from './components/UploadZone'
import type { MediaFile, MediaFilter, MediaStats, ViewMode } from './types'

interface MidiaClientProps {
  initialFiles: MediaFile[]
}

export default function MidiaClient({ initialFiles }: MidiaClientProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles)
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const filteredFiles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return files.filter((file) => {
      const matchesSearch = !normalizedSearch || file.name.toLowerCase().includes(normalizedSearch)
      if (!matchesSearch) return false

      if (filter === 'images') return file.type.startsWith('image/') && file.type !== 'image/svg+xml'
      if (filter === 'documents') return file.type.includes('pdf')
      if (filter === 'videos') return file.type.startsWith('video/')
      if (filter === 'svg') return file.type === 'image/svg+xml'
      return true
    })
  }, [files, filter, search])

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedIds.has(file.id)),
    [files, selectedIds]
  )

  const stats = useMemo<MediaStats>(() => {
    const base: MediaStats = { total: 0, images: 0, documents: 0, videos: 0, svg: 0, totalSize: 0 }

    for (const file of files) {
      base.total += 1
      base.totalSize += file.size

      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') base.images += 1
      if (file.type.includes('pdf')) base.documents += 1
      if (file.type.startsWith('video/')) base.videos += 1
      if (file.type === 'image/svg+xml') base.svg += 1
    }

    return base
  }, [files])

  const refreshFiles = async () => {
    const response = await listMediaFiles()
    if (response.error) {
      toast.error(response.error)
      return
    }

    setFiles(response.files as MediaFile[])
    setSelectedIds(new Set())
    if (detailFile) {
      const updated = response.files.find((item) => item.id === detailFile.id) ?? null
      setDetailFile(updated as MediaFile | null)
    }
  }

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDelete = async (paths: string[]) => {
    const response = await deleteMediaFiles(paths)
    if ('error' in response) {
      toast.error(response.error)
      return
    }

    toast.success('Arquivo(s) excluído(s).')
    await refreshFiles()
  }

  const copySelectedUrls = async () => {
    const urls = selectedFiles.map((file) => file.public_url).filter(Boolean)
    if (!urls.length) return

    try {
      await navigator.clipboard.writeText(urls.join('\n'))
      toast.success('URLs copiadas.')
    } catch {
      toast.error('Não foi possível copiar as URLs.')
    }
  }

  return (
    <div className="animate-fade-in px-6 py-5 lg:px-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Mídia</h1>
        <p className="text-[#94a3b8]">Gerencie os arquivos do bucket site-assets.</p>
      </div>

      <MediaToolbar
        filter={filter}
        search={search}
        viewMode={viewMode}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        onViewModeChange={setViewMode}
        onToggleUpload={() => setShowUploadZone((prev) => !prev)}
      />

      {showUploadZone && <UploadZone onUploadComplete={refreshFiles} />}

      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#0ea5e9]">{selectedIds.size} selecionado(s)</span>
          <button
            type="button"
            onClick={() => void copySelectedUrls()}
            className="px-3 py-1.5 rounded-lg border border-[#1e3a5f] text-xs text-[#94a3b8] hover:text-[#0ea5e9]"
          >
            Copiar URLs
          </button>
          <button
            type="button"
            onClick={() => setBulkDeleteOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10"
          >
            Excluir selecionados
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-[#64748b] hover:text-[#94a3b8]"
          >
            Limpar
          </button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <MediaGrid files={filteredFiles} selectedIds={selectedIds} onSelect={handleSelect} onOpenDetail={setDetailFile} />
      ) : (
        <MediaList files={filteredFiles} selectedIds={selectedIds} onSelect={handleSelect} onOpenDetail={setDetailFile} />
      )}

      <StorageStats stats={stats} />

      <DetailPanel
        file={detailFile}
        open={Boolean(detailFile)}
        onClose={() => setDetailFile(null)}
        onDelete={handleDelete}
      />

      <DeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          void handleDelete(selectedFiles.map((file) => file.path))
          setBulkDeleteOpen(false)
        }}
        items={selectedFiles.map((file) => ({ id: file.id, name: file.name }))}
      />
    </div>
  )
}
