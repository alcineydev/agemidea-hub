'use client'

import type { MediaFile } from '../types'
import MediaCard from './MediaCard'

interface MediaGridProps {
  files: MediaFile[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onOpenDetail: (file: MediaFile) => void
}

export default function MediaGrid({ files, selectedIds, onSelect, onOpenDetail }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
      {files.map((file) => (
        <MediaCard
          key={file.id}
          file={file}
          selected={selectedIds.has(file.id)}
          onSelect={onSelect}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  )
}
