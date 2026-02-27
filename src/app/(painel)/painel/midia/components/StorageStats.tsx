'use client'

import type { MediaStats } from '../types'

interface StorageStatsProps {
  stats: MediaStats
}

const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024

export default function StorageStats({ stats }: StorageStatsProps) {
  const usagePercent = Math.min((stats.totalSize / STORAGE_LIMIT_BYTES) * 100, 100)

  return (
    <footer className="mt-5 rounded-xl border border-[#1e3a5f] bg-[#111827] px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-4 text-xs text-[#94a3b8]">
        <span>Total: {stats.total}</span>
        <span>Imagens: {stats.images}</span>
        <span>Documentos: {stats.documents}</span>
        <span>Vídeos: {stats.videos}</span>
        <span>SVG: {stats.svg}</span>
      </div>
      <div className="w-full lg:max-w-[320px]">
        <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1">
          <span>Uso do storage</span>
          <span>{usagePercent.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#0a0f1e] overflow-hidden border border-[#1e3a5f]/50">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${usagePercent}%` }} />
        </div>
      </div>
    </footer>
  )
}
