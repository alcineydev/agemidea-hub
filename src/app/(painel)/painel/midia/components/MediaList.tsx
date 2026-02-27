'use client'

import type { MediaFile } from '../types'
import MediaRow from './MediaRow'

interface MediaListProps {
  files: MediaFile[]
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onOpenDetail: (file: MediaFile) => void
}

export default function MediaList({ files, selectedIds, onSelect, onOpenDetail }: MediaListProps) {
  return (
    <div className="rounded-xl border border-[#1e3a5f] overflow-hidden bg-[#111827]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#0a0f1e] border-b border-[#1e3a5f]">
            <th className="px-3 py-2 text-left text-xs text-[#64748b] uppercase tracking-wide">Sel.</th>
            <th className="px-3 py-2 text-left text-xs text-[#64748b] uppercase tracking-wide">Arquivo</th>
            <th className="px-3 py-2 text-left text-xs text-[#64748b] uppercase tracking-wide">Tipo</th>
            <th className="px-3 py-2 text-left text-xs text-[#64748b] uppercase tracking-wide">Tamanho</th>
            <th className="px-3 py-2 text-left text-xs text-[#64748b] uppercase tracking-wide">Enviado em</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <MediaRow
              key={file.id}
              file={file}
              selected={selectedIds.has(file.id)}
              onSelect={onSelect}
              onOpenDetail={onOpenDetail}
            />
          ))}
          {files.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-sm text-[#64748b]">
                Nenhum arquivo encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
