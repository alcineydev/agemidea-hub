'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import Pagination from '@/components/ui/Pagination'
import { formatDate } from '@/lib/utils'
import type { ClientAdminListItem } from '../_actions'

interface ClientesListClientProps {
  clients: ClientAdminListItem[]
}

const ITEMS_PER_PAGE = 20

export default function ClientesListClient({ clients }: ClientesListClientProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return clients
    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(term) ||
        (client.email ?? '').toLowerCase().includes(term) ||
        (client.document ?? '').toLowerCase().includes(term)
      )
    })
  }, [clients, search])

  const paginated = useMemo(() => {
    const from = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(from, from + ITEMS_PER_PAGE)
  }, [filtered, page])

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-slate-500">
            Clientes de orcamento e clientes com acesso ao painel.
          </p>
        </div>
        <Link
          href="/painel/clientes/novo"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Novo cliente
        </Link>
      </header>

      <div className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Buscar por nome, email ou documento..."
          className="w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-[#1e3a5f]/20 bg-[#050510]/40">
                {['Nome', 'Email', 'Documento', 'Tag', 'Criado em', 'Acoes'].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
              {paginated.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-[#1e3a5f]/10 last:border-0 hover:bg-[#1e3a5f]/10"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-200">{client.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{client.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{client.document || '-'}</td>
                  <td className="px-4 py-3">
                    {client.panel_enabled ? (
                      <span className="inline-flex rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                        Painel
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-300">
                        Orcamento
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatDate(client.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/painel/clientes/${client.id}`}
                      className="inline-flex h-8 items-center rounded-md border border-[#1e3a5f]/30 px-3 text-xs font-semibold text-slate-300"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end border-t border-[#1e3a5f]/20 bg-[#050510]/40 px-4 py-3">
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
