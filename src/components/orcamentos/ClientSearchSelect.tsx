'use client'

import { useEffect, useMemo, useState } from 'react'

import { getClients } from '@/app/(painel)/painel/orcamentos/_actions'
import type { Client } from '@/types/quotes'

interface ClientSearchSelectProps {
  selectedClient: Client | null
  initialClients: Client[]
  readOnly?: boolean
  onSelect: (client: Client) => void
  onClear: () => void
  onCreateNew: () => void
}

export default function ClientSearchSelect({
  selectedClient,
  initialClients,
  readOnly = false,
  onSelect,
  onClear,
  onCreateNew,
}: ClientSearchSelectProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Client[]>(initialClients)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (selectedClient) return
    const timeoutId = setTimeout(() => {
      if (!search.trim()) {
        setResults(initialClients)
        return
      }
      setLoading(true)
      void getClients(search.trim())
        .then((data) => {
          setResults(data)
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [initialClients, search, selectedClient])

  const emptyResults = useMemo(() => !loading && open && results.length === 0, [loading, open, results.length])

  if (selectedClient) {
    return (
      <div className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Cliente selecionado</h3>
          {!readOnly && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md border border-[#1e3a5f]/30 px-2 py-1 text-xs font-semibold text-slate-400"
            >
              Remover
            </button>
          )}
        </div>
        <p className="text-sm font-semibold text-cyan-300">{selectedClient.name}</p>
        <p className="text-xs text-slate-500">{selectedClient.email || 'Sem email'}</p>
        <p className="text-xs text-slate-500">{selectedClient.document || 'Sem documento'}</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Cliente</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={onCreateNew}
            className="rounded-md border border-cyan-500/30 px-2 py-1 text-xs font-semibold text-cyan-300"
          >
            Novo cliente
          </button>
        )}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120)
        }}
        placeholder="Buscar por nome, email ou documento..."
        className="w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40"
        disabled={readOnly}
      />

      {open && (
        <div className="absolute left-4 right-4 top-[86px] z-20 max-h-64 overflow-y-auto rounded-lg border border-[#1e3a5f]/25 bg-[#050510] p-1">
          {loading && <p className="p-3 text-xs text-slate-500">Buscando...</p>}
          {emptyResults && <p className="p-3 text-xs text-slate-500">Nenhum cliente encontrado.</p>}
          {results.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => {
                onSelect(client)
                setOpen(false)
              }}
              className="w-full rounded-md px-3 py-2 text-left hover:bg-[#1e3a5f]/20"
            >
              <p className="text-sm font-semibold text-slate-200">{client.name}</p>
              <p className="text-xs text-slate-500">
                {client.email || 'Sem email'} - {client.document || 'Sem documento'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
