'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  bulkDeleteModels,
  bulkUpdateModelsStatus,
  deleteModel,
  duplicateModel,
  type ModelRecord,
} from '@/lib/actions/models'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import Pagination from '@/components/ui/Pagination'
import TriggerCopyModal from '@/components/ui/TriggerCopyModal'

interface ModelsListClientProps {
  models: ModelRecord[]
}

const ITEMS_PER_PAGE = 20
const TYPE_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'header', label: 'Header' },
  { value: 'footer', label: 'Footer' },
  { value: 'popup', label: 'Popup' },
  { value: 'card', label: 'Card' },
] as const

const badgeColors = {
  header: 'bg-violet-500/10 text-violet-400',
  footer: 'bg-cyan-600/10 text-cyan-300',
  popup: 'bg-pink-500/10 text-pink-400',
  card: 'bg-green-500/10 text-green-400',
} as const

function getVisibilityLabel(model: ModelRecord): string {
  const pagesCount = model.visibility_pages?.length ?? 0
  if (model.visibility_mode === 'all') return 'Todas'
  if (model.visibility_mode === 'specific') return `Específicas: ${pagesCount}`
  return `Exceto: ${pagesCount}`
}

export function ModelsListClient({ models }: ModelsListClientProps) {
  const [searchValue, setSearchValue] = useState('')
  const [filterType, setFilterType] = useState<string>('todos')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<ModelRecord | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [triggerTarget, setTriggerTarget] = useState<ModelRecord | null>(null)
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    return models.filter((model) => {
      const typeMatch = filterType === 'todos' || model.model_type === filterType
      const searchMatch =
        !search ||
        model.name.toLowerCase().includes(search) ||
        (model.description ?? '').toLowerCase().includes(search)
      return typeMatch && searchMatch
    })
  }, [filterType, models, searchValue])

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage, filteredItems])

  const selectedItems = paginatedItems.filter((item) => selectedIds.has(item.id))
  const activeCount = models.filter((item) => item.status === 'ativo').length
  const inactiveCount = models.filter((item) => item.status === 'inativo').length

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

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteModel(deleteTarget.id)
      toast.success('Modelo excluído com sucesso.')
      setDeleteTarget(null)
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir modelo.')
    }
  }

  const handleDuplicate = async (id: string) => {
    setDuplicateLoadingId(id)
    try {
      await duplicateModel(id)
      toast.success('Modelo duplicado com sucesso.')
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao duplicar modelo.')
    } finally {
      setDuplicateLoadingId(null)
    }
  }

  const onBulkActivate = async () => {
    try {
      await bulkUpdateModelsStatus(Array.from(selectedIds), 'active')
      toast.success('Modelos ativados.')
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao ativar modelos.')
    }
  }

  const onBulkDeactivate = async () => {
    try {
      await bulkUpdateModelsStatus(Array.from(selectedIds), 'inactive')
      toast.success('Modelos desativados.')
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao desativar modelos.')
    }
  }

  const onBulkDelete = async () => {
    try {
      await bulkDeleteModels(Array.from(selectedIds))
      toast.success('Modelos excluídos.')
      setSelectedIds(new Set())
      setBulkDeleteOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir modelos.')
    }
  }

  const checkboxClass =
    "w-4 h-4 rounded border-[1.5px] border-[#1e3a5f]/40 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer appearance-none relative checked:after:content-['✓'] checked:after:text-white checked:after:text-[10px] checked:after:font-bold checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center"

  const emptyMessage = useMemo(() => {
    if (searchValue) return 'Nenhum modelo encontrado para a busca.'
    if (filterType !== 'todos') return 'Nenhum modelo para o tipo selecionado.'
    return 'Nenhum modelo cadastrado.'
  }, [searchValue, filterType])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por nome ou descrição..."
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
        type="models"
        onPublish={onBulkActivate}
        onDraft={onBulkDeactivate}
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
                  aria-label="Selecionar todos os modelos da página atual"
                  checked={paginatedItems.length > 0 && selectedIds.size === paginatedItems.length}
                  onChange={toggleAll}
                  className={checkboxClass}
                />
              </th>
              {['Nome', 'Tipo', 'Status', 'Visibilidade', 'Prioridade', 'Atualizado', 'Ações'].map((column) => (
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
                  {emptyMessage}
                </td>
              </tr>
            )}
            {paginatedItems.map((model) => {
              const selected = selectedIds.has(model.id)
              return (
                <tr
                  key={model.id}
                  className={`border-b border-[#1e3a5f]/8 transition-colors hover:bg-[#1e3a5f]/6 ${selected ? 'bg-cyan-500/[.04]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Selecionar modelo ${model.name}`}
                      checked={selected}
                      onChange={() => toggleSelect(model.id)}
                      className={checkboxClass}
                    />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-300">{model.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${badgeColors[model.model_type]}`}>
                      {model.model_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-[12px] ${model.status === 'ativo' ? 'text-green-400' : 'text-amber-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${model.status === 'ativo' ? 'bg-green-400' : 'bg-amber-400'}`} />
                      {model.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-400">{getVisibilityLabel(model)}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-500">{model.priority}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-500">{new Date(model.updated_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      {model.model_type === 'popup' && (
                        <button
                          type="button"
                          onClick={() => setTriggerTarget(model)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-[#1e3a5f]/15 hover:text-pink-400 transition-all relative group"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                          </svg>
                          <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Trigger
                          </span>
                        </button>
                      )}
                      <Link
                        href={`/painel/paginas/modelos/${model.id}/editar`}
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
                      <button
                        type="button"
                        disabled={duplicateLoadingId === model.id}
                        onClick={() => handleDuplicate(model.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-[#1e3a5f]/15 hover:text-violet-400 transition-all relative group disabled:opacity-40"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {duplicateLoadingId === model.id ? 'Duplicando...' : 'Duplicar'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(model)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-[#1e3a5f]/15 hover:text-red-400 transition-all relative group"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Excluir
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0f1e]/30 border-t border-[#1e3a5f]/10">
          <div className="flex gap-4 text-[12px] text-slate-700">
            <span>{models.length} modelos</span>
            <span>
              <span className="text-green-400">●</span> <span className="text-slate-500 font-medium">{activeCount} ativos</span>
            </span>
            <span>
              <span className="text-amber-400">●</span> <span className="text-slate-500 font-medium">{inactiveCount} inativos</span>
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

      <TriggerCopyModal
        open={Boolean(triggerTarget)}
        onClose={() => setTriggerTarget(null)}
        modelId={triggerTarget?.id ?? ''}
        modelName={triggerTarget?.name ?? ''}
      />

      <DeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={onBulkDelete}
        items={selectedItems.map((item) => ({ id: item.id, name: item.name }))}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        items={deleteTarget ? [{ id: deleteTarget.id, name: deleteTarget.name }] : []}
      />
    </div>
  )
}
