'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { QuoteStatus } from '@/types/quotes'

interface QuoteFiltersProps {
  initialSearch?: string
  initialStatus?: QuoteStatus | 'all'
}

const STATUSES: Array<{ label: string; value: QuoteStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Rascunho', value: 'draft' },
  { label: 'Enviado', value: 'sent' },
  { label: 'Aprovado', value: 'approved' },
  { label: 'Recusado', value: 'rejected' },
]

export default function QuoteFilters({ initialSearch = '', initialStatus = 'all' }: QuoteFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState<QuoteStatus | 'all'>(initialStatus)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search.trim()) params.set('search', search.trim())
      else params.delete('search')
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [pathname, router, search, searchParams])

  const handleStatusChange = (value: QuoteStatus | 'all') => {
    setStatus(value)
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all') params.delete('status')
    else params.set('status', value)

    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <div className="mb-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por numero ou titulo..."
          className="w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-500/40"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handleStatusChange(item.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              item.value === status
                ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                : 'border-[#1e3a5f]/20 text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
