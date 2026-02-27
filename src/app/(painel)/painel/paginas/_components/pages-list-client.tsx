'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { bulkDeletePages, bulkUpdatePagesStatus, deletePage } from '@/lib/actions/pages'
import { formatDateTime } from '@/lib/utils'
import type { Page } from '@/types'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import Pagination from '@/components/ui/Pagination'

interface PagesListClientProps {
  pages: Page[]
}

const ITEMS_PER_PAGE = 20
const TYPE_FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'home', label: 'Home' },
  { value: 'normal', label: 'Normal' },
  { value: '404', label: '404' },
  { value: 'blog', label: 'Blog' },
] as const

const typeBadgeMap: Record<Page['page_type'], string> = {
  home: 'bg-cyan-500/10 text-cyan-400',
  normal: 'bg-slate-500/10 text-slate-400',
  '404': 'bg-amber-500/10 text-amber-400',
  blog: 'bg-violet-500/10 text-violet-400',
}

const displayModeBadgeMap: Record<'body' | 'fullscreen', string> = {
  body: 'bg-slate-500/10 text-slate-400',
  fullscreen: 'bg-violet-500/10 text-violet-400',
}

function ActionButton({
  label,
  onClick,
  children,
  colorClass = 'hover:text-cyan-400',
}: {
  label: string
  onClick: () => void
  children: ReactNode
  colorClass?: string
}) {
  return (
    <button
      data-tip={label}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-[#1e3a5f]/15 ${colorClass} transition-all relative group`}
    >
      {children}
      <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {label}
      </span>
    </button>
  )
}

export function PagesListClient({ pages }: PagesListClientProps) {
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [filterType, setFilterType] = useState<string>('todas')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  const filteredItems = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    return pages.filter((page) => {
      const typeMatch = filterType === 'todas' || page.page_type === filterType
      const searchMatch =
        !search ||
        page.title.toLowerCase().includes(search) ||
        page.slug.toLowerCase().includes(search)
      return typeMatch && searchMatch
    })
  }, [filterType, pages, searchValue])

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage, filteredItems])

  const selectedItems = paginatedItems.filter((item) => selectedIds.has(item.id))
  const publishedCount = pages.filter((item) => item.status === 'publicada').length
  const draftsCount = pages.filter((item) => item.status === 'rascunho').length

  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, filterType])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === paginatedItems.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(paginatedItems.map((item) => item.id)))
  }

  const onBulkPublish = async () => {
    try {
      await bulkUpdatePagesStatus(Array.from(selectedIds), 'published')
      toast.success('Páginas publicadas.')
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao publicar páginas.')
    }
  }

  const onBulkDraft = async () => {
    try {
      await bulkUpdatePagesStatus(Array.from(selectedIds), 'draft')
      toast.success('Páginas movidas para rascunho.')
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar páginas.')
    }
  }

  const onBulkDelete = async () => {
    try {
      await bulkDeletePages(Array.from(selectedIds))
      toast.success('Páginas excluídas.')
      setSelectedIds(new Set())
      setBulkDeleteOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir páginas.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePage(deleteTarget.id)
      toast.success('Página excluída com sucesso.')
      setDeleteTarget(null)
      window.location.reload()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir página.'
      toast.error(message)
    }
  }

  const emptyStateMessage = useMemo(() => {
    if (searchValue) return 'Nenhuma página encontrada para a busca.'
    if (filterType !== 'todas') return 'Nenhuma página encontrada para o tipo selecionado.'
    return 'Nenhuma página cadastrada.'
  }, [searchValue, filterType])

  const checkboxClass =
    "w-4 h-4 rounded border-[1.5px] border-[#1e3a5f]/40 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer appearance-none relative checked:after:content-['✓'] checked:after:text-white checked:after:text-[10px] checked:after:font-bold checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por título ou slug..."
            className="w-full rounded-lg border border-[#1e3a5f]/20 bg-[#050510]/50 text-slate-300 px-3 py-2 text-[13px] outline-none focus:border-cyan-500/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setFilterType(filter.value)}
              className={`px-3 py-2 rounded-lg text-[12px] border transition-all ${
                filterType === filter.value
                  ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/[.08]'
                  : 'text-slate-600 border-[#1e3a5f]/20 hover:text-slate-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <BulkActionBar
        count={selectedIds.size}
        type="pages"
        onPublish={onBulkPublish}
        onDraft={onBulkDraft}
        onDelete={() => setBulkDeleteOpen(true)}
        onClear={() => setSelectedIds(new Set())}
      />

      <div className="border border-[#1e3a5f]/15 rounded-xl overflow-hidden bg-[#050510]/30">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 tracking-wider uppercase bg-[#0a0f1e]/50 border-b border-[#1e3a5f]/15 w-[40px]">
                <input
                  type="checkbox"
                  aria-label="Selecionar todas as páginas da página atual"
                  checked={paginatedItems.length > 0 && selectedIds.size === paginatedItems.length}
                  onChange={toggleAll}
                  className={checkboxClass}
                />
              </th>
              {['Título', 'Slug', 'Tipo', 'Status', 'Exibição', 'Atualizado', 'Ações'].map((column) => (
                <th
                  key={column}
                  className="px-4 py-2.5 text-[11px] font-semibold text-slate-600 tracking-wider uppercase bg-[#0a0f1e]/50 border-b border-[#1e3a5f]/15 text-left"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-slate-600">
                  {emptyStateMessage}
                </td>
              </tr>
            )}
            {paginatedItems.map((page) => {
              const selected = selectedIds.has(page.id)
              return (
                <tr
                  key={page.id}
                  className={`border-b border-[#1e3a5f]/8 transition-colors hover:bg-[#1e3a5f]/6 ${selected ? 'bg-cyan-500/[.04]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Selecionar página ${page.title}`}
                      checked={selected}
                      onChange={() => toggleSelect(page.id)}
                      className={checkboxClass}
                    />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-300">{page.title}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-500 font-mono">
                    {page.page_type === 'home' ? '/' : `/${page.slug}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${typeBadgeMap[page.page_type]}`}>
                      {page.page_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-[12px] ${page.status === 'publicada' ? 'text-green-400' : 'text-amber-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${page.status === 'publicada' ? 'bg-green-400' : 'bg-amber-400'}`} />
                      {page.status === 'publicada' ? 'Publicada' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                        displayModeBadgeMap[page.display_mode === 'fullscreen' ? 'fullscreen' : 'body']
                      }`}
                    >
                      {page.display_mode === 'fullscreen' ? 'Tela Total' : 'Corpo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-500">{formatDateTime(page.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Link
                        href={`/painel/paginas/${page.id}/editar`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-[#1e3a5f]/15 hover:text-cyan-400 transition-all relative group"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Editar
                        </span>
                      </Link>
                      <Link
                        href={page.page_type === 'home' ? '/' : `/${page.slug}`}
                        target="_blank"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-[#1e3a5f]/15 hover:text-green-400 transition-all relative group"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Ver
                        </span>
                      </Link>
                      <ActionButton label="Excluir" onClick={() => setDeleteTarget(page)} colorClass="hover:text-red-400">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0f1e]/30 border-t border-[#1e3a5f]/10">
          <div className="flex gap-4 text-[12px] text-slate-700">
            <span>{pages.length} páginas</span>
            <span>
              <span className="text-green-400">●</span> <span className="text-slate-500 font-medium">{publishedCount} publicadas</span>
            </span>
            <span>
              <span className="text-amber-400">●</span> <span className="text-slate-500 font-medium">{draftsCount} rascunhos</span>
            </span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredItems.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <DeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={onBulkDelete}
        items={selectedItems.map((item) => ({ id: item.id, name: item.title }))}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        items={deleteTarget ? [{ id: deleteTarget.id, name: deleteTarget.title }] : []}
      />
    </div>
  )
}
