'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { deletePage } from '@/lib/actions/pages'
import { formatDateTime } from '@/lib/utils'
import type { Page } from '@/types'
import { ConfirmModal } from '@/components/ui/confirm-modal'

interface PagesListClientProps {
  pages: Page[]
  stats: {
    total: number
    publicadas: number
    rascunhos: number
  }
}

const TYPE_FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'home', label: 'Home' },
  { value: 'normal', label: 'Normal' },
  { value: '404', label: '404' },
  { value: 'blog', label: 'Blog' },
] as const

const typeBadgeMap: Record<Page['page_type'], string> = {
  home: 'text-[#0ea5e9] bg-[#0ea5e91a]',
  normal: 'text-[#94a3b8] bg-[#94a3b81a]',
  '404': 'text-[#f59e0b] bg-[#f59e0b1a]',
  blog: 'text-[#8b5cf6] bg-[#8b5cf61a]',
}

export function PagesListClient({ pages, stats }: PagesListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')

  const selectedType = searchParams.get('type') ?? 'todas'

  const emptyStateMessage = useMemo(() => {
    if (searchParams.get('search')) return 'Nenhuma página encontrada para a busca.'
    if (selectedType !== 'todas') return 'Nenhuma página encontrada para o tipo selecionado.'
    return 'Nenhuma página cadastrada.'
  }, [searchParams, selectedType])

  const updateQuery = (next: { type?: string; search?: string }) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (next.type !== undefined) {
        if (!next.type || next.type === 'todas') params.delete('type')
        else params.set('type', next.type)
      }

      if (next.search !== undefined) {
        if (!next.search.trim()) params.delete('search')
        else params.set('search', next.search.trim())
      }

      const query = params.toString()
      router.push(query ? `/painel/paginas?${query}` : '/painel/paginas')
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await deletePage(deleteTarget.id)
      toast.success('Página excluída com sucesso.')
      setDeleteTarget(null)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir página.'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">🔍</span>
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') updateQuery({ search: searchValue })
              }}
              placeholder="Buscar por título ou slug..."
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white pl-10 pr-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
            />
          </div>
          <button
            type="button"
            onClick={() => updateQuery({ search: searchValue })}
            className="px-4 py-2 rounded-lg border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30] text-sm"
          >
            Buscar
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => updateQuery({ type: filter.value })}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedType === filter.value
                  ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                  : 'border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:block bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#050510] text-[#94a3b8]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Título</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Atualizado</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#64748b]">
                  {emptyStateMessage}
                </td>
              </tr>
            )}
            {pages.map((page) => (
              <tr key={page.id} className="border-t border-[#1e3a5f]/40">
                <td className="px-4 py-3 text-white">{page.title}</td>
                <td className="px-4 py-3 text-[#94a3b8] font-mono">
                  {page.page_type === 'home' ? '/' : `/${page.slug}`}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${typeBadgeMap[page.page_type]}`}>
                    {page.page_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      page.status === 'publicada' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#94a3b8]">{formatDateTime(page.updated_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end items-center gap-2">
                    <Link
                      href={`/painel/paginas/${page.id}/editar`}
                      className="px-2.5 py-1.5 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30]"
                    >
                      ✏️ Editar
                    </Link>
                    <Link
                      href={page.page_type === 'home' ? '/' : `/${page.slug}`}
                      target="_blank"
                      className="px-2.5 py-1.5 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30]"
                    >
                      👁 Ver
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(page)}
                      className="px-2.5 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      🗑 Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {pages.length === 0 && (
          <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-6 text-center text-[#64748b]">
            {emptyStateMessage}
          </div>
        )}
        {pages.map((page) => (
          <div key={page.id} className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold">{page.title}</h3>
                <p className="text-[#94a3b8] font-mono text-xs mt-1">
                  {page.page_type === 'home' ? '/' : `/${page.slug}`}
                </p>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${typeBadgeMap[page.page_type]}`}>
                {page.page_type}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={page.status === 'publicada' ? 'text-emerald-400' : 'text-amber-400'}>
                ● {page.status}
              </span>
              <span className="text-[#94a3b8]">{formatDateTime(page.updated_at)}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <Link
                href={`/painel/paginas/${page.id}/editar`}
                className="text-center px-2 py-2 rounded-lg border border-[#1e3a5f] text-[#cbd5e1]"
              >
                ✏️ Editar
              </Link>
              <Link
                href={page.page_type === 'home' ? '/' : `/${page.slug}`}
                target="_blank"
                className="text-center px-2 py-2 rounded-lg border border-[#1e3a5f] text-[#cbd5e1]"
              >
                👁 Ver
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(page)}
                className="text-center px-2 py-2 rounded-lg border border-red-500/50 text-red-400"
              >
                🗑 Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-4 text-sm text-[#94a3b8] flex flex-wrap gap-4">
        <span>{stats.total} páginas no total</span>
        <span className="text-emerald-400">● {stats.publicadas} publicadas</span>
        <span className="text-amber-400">● {stats.rascunhos} rascunhos</span>
        {isPending && <span className="text-[#0ea5e9]">Atualizando filtros...</span>}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Excluir página"
        message={`Tem certeza que deseja excluir "${deleteTarget?.title ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  )
}
