'use client'

import type { MediaFilter, ViewMode } from '../types'

interface MediaToolbarProps {
  filter: MediaFilter
  search: string
  viewMode: ViewMode
  onFilterChange: (filter: MediaFilter) => void
  onSearchChange: (value: string) => void
  onViewModeChange: (mode: ViewMode) => void
  onToggleUpload: () => void
}

const FILTERS: Array<{ id: MediaFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'images', label: 'Imagens' },
  { id: 'documents', label: 'Documentos' },
  { id: 'videos', label: 'Vídeos' },
  { id: 'svg', label: 'SVG' },
]

export default function MediaToolbar({
  filter,
  search,
  viewMode,
  onFilterChange,
  onSearchChange,
  onViewModeChange,
  onToggleUpload,
}: MediaToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome do arquivo..."
            className="w-full rounded-xl border border-[#1e3a5f] bg-[#111827] text-white px-4 py-2.5 text-sm outline-none focus:border-cyan-500/60"
          />
        </div>
        <button
          type="button"
          onClick={onToggleUpload}
          className="px-4 py-2.5 rounded-xl border border-[#1e3a5f] text-[#94a3b8] hover:text-[#0ea5e9] hover:border-cyan-500/40 transition-all"
        >
          Upload
        </button>
        <div className="flex items-center rounded-xl border border-[#1e3a5f] bg-[#111827] p-1">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'grid' ? 'bg-cyan-500/10 text-[#0ea5e9]' : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            Grade
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'list' ? 'bg-cyan-500/10 text-[#0ea5e9]' : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onFilterChange(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
              filter === item.id
                ? 'border-cyan-500/50 bg-cyan-500/10 text-[#0ea5e9]'
                : 'border-[#1e3a5f] text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
