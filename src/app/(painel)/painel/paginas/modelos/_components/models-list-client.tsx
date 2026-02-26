'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  deleteModel,
  duplicateModel,
  type ModelRecord,
  type ModelStatus,
  type ModelType,
} from '@/lib/actions/models'
import { ConfirmModal } from '@/components/ui/confirm-modal'

interface ModelsListClientProps {
  models: ModelRecord[]
  stats: {
    total: number
    ativos: number
    inativos: number
    headers: number
    footers: number
    popups: number
    cards: number
  }
}

const TYPE_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'header', label: '🔝 Header' },
  { value: 'footer', label: '🔻 Footer' },
  { value: 'popup', label: '💬 Popup' },
  { value: 'card', label: '🃏 Card' },
] as const

const STATUS_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativo', label: '● Ativos' },
  { value: 'inativo', label: '○ Inativos' },
] as const

const typeConfig: Record<ModelType, { className: string; icon: string; label: string }> = {
  header: { className: 'text-[#0ea5e9] bg-[#0ea5e91a]', icon: '🔝', label: 'Header' },
  footer: { className: 'text-[#6366f1] bg-[#6366f11a]', icon: '🔻', label: 'Footer' },
  popup: { className: 'text-[#f59e0b] bg-[#f59e0b1a]', icon: '💬', label: 'Popup' },
  card: { className: 'text-[#10b981] bg-[#10b9811a]', icon: '🃏', label: 'Card' },
}

const statusConfig: Record<ModelStatus, { className: string; label: string }> = {
  ativo: { className: 'text-emerald-400', label: '● Ativo' },
  inativo: { className: 'text-slate-400', label: '○ Inativo' },
}

function visibilityLabel(model: ModelRecord): string {
  const pagesCount = model.visibility_pages?.length ?? 0

  if (model.visibility_mode === 'all') return '🌐 Todas'
  if (model.visibility_mode === 'specific') return `📌 Específicas: ${pagesCount}`
  return `🚫 Exceto: ${pagesCount}`
}

export function ModelsListClient({ models, stats }: ModelsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')
  const [deleteTarget, setDeleteTarget] = useState<ModelRecord | null>(null)
  const [triggerTarget, setTriggerTarget] = useState<ModelRecord | null>(null)
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('Copiado!'))
      .catch(() => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success('Copiado!')
      })
  }

  const selectedType = searchParams.get('type') ?? 'todos'
  const selectedStatus = searchParams.get('status') ?? 'todos'

  const emptyMessage = useMemo(() => {
    if (searchParams.get('search')) return 'Nenhum modelo encontrado para a busca.'
    if (selectedType !== 'todos' || selectedStatus !== 'todos') return 'Nenhum modelo para os filtros selecionados.'
    return 'Nenhum modelo cadastrado.'
  }, [searchParams, selectedStatus, selectedType])

  const updateQuery = (next: { type?: string; status?: string; search?: string }) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (next.type !== undefined) {
        if (!next.type || next.type === 'todos') params.delete('type')
        else params.set('type', next.type)
      }

      if (next.status !== undefined) {
        if (!next.status || next.status === 'todos') params.delete('status')
        else params.set('status', next.status)
      }

      if (next.search !== undefined) {
        if (!next.search.trim()) params.delete('search')
        else params.set('search', next.search.trim())
      }

      const query = params.toString()
      router.push(query ? `/painel/paginas/modelos?${query}` : '/painel/paginas/modelos')
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteModel(deleteTarget.id)
      toast.success('Modelo excluído com sucesso.')
      setDeleteTarget(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir modelo.')
    }
  }

  const handleDuplicate = async (id: string) => {
    setDuplicateLoadingId(id)
    try {
      await duplicateModel(id)
      toast.success('Modelo duplicado com sucesso.')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao duplicar modelo.')
    } finally {
      setDuplicateLoadingId(null)
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
              placeholder="Buscar por nome ou descrição..."
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

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => updateQuery({ status: filter.value })}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedStatus === filter.value
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
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
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Visibilidade</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Prioridade</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#64748b]">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {models.map((model) => (
              <tr key={model.id} className="border-t border-[#1e3a5f]/40">
                <td className="px-4 py-3">
                  <div className="text-white">{model.name}</div>
                  <div className="text-xs text-[#64748b] truncate max-w-[360px]">{model.description || '-'}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${typeConfig[model.model_type].className}`}>
                    <span>{typeConfig[model.model_type].icon}</span>
                    <span>{typeConfig[model.model_type].label}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-[#cbd5e1]">{visibilityLabel(model)}</td>
                <td className="px-4 py-3">
                  <span className={statusConfig[model.status].className}>{statusConfig[model.status].label}</span>
                </td>
                <td className="px-4 py-3 text-[#cbd5e1]">{model.priority}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end items-center gap-2">
                    <Link
                      href={`/painel/paginas/modelos/${model.id}/editar`}
                      className="px-2.5 py-1.5 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30]"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      type="button"
                      disabled={duplicateLoadingId === model.id}
                      onClick={() => handleDuplicate(model.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30] disabled:opacity-50"
                    >
                      {duplicateLoadingId === model.id ? 'Duplicando...' : '📋 Duplicar'}
                    </button>
                    {model.model_type === 'popup' && (
                      <button
                        type="button"
                        onClick={() => setTriggerTarget(model)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30]"
                      >
                        🔗 Trigger
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(model)}
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
        {models.length === 0 && (
          <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-6 text-center text-[#64748b]">
            {emptyMessage}
          </div>
        )}
        {models.map((model) => (
          <div key={model.id} className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-semibold">{model.name}</h3>
                <p className="text-xs text-[#64748b] mt-1">{model.description || 'Sem descrição'}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${typeConfig[model.model_type].className}`}>
                {typeConfig[model.model_type].icon} {typeConfig[model.model_type].label}
              </span>
            </div>
            <div className="mt-3 text-xs text-[#cbd5e1]">{visibilityLabel(model)}</div>
            <div className="mt-1 text-xs">
              <span className={statusConfig[model.status].className}>{statusConfig[model.status].label}</span>
              <span className="text-[#94a3b8] ml-3">Prioridade: {model.priority}</span>
            </div>
            <div className={`mt-3 grid gap-2 text-xs ${model.model_type === 'popup' ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <Link
                href={`/painel/paginas/modelos/${model.id}/editar`}
                className="text-center px-2 py-2 rounded-lg border border-[#1e3a5f] text-[#cbd5e1]"
              >
                ✏️ Editar
              </Link>
              <button
                type="button"
                disabled={duplicateLoadingId === model.id}
                onClick={() => handleDuplicate(model.id)}
                className="text-center px-2 py-2 rounded-lg border border-[#1e3a5f] text-[#cbd5e1] disabled:opacity-50"
              >
                📋 Duplicar
              </button>
              {model.model_type === 'popup' && (
                <button
                  type="button"
                  onClick={() => setTriggerTarget(model)}
                  className="text-center px-2 py-2 rounded-lg border border-[#1e3a5f] text-[#cbd5e1]"
                >
                  🔗 Trigger
                </button>
              )}
              <button
                type="button"
                onClick={() => setDeleteTarget(model)}
                className="text-center px-2 py-2 rounded-lg border border-red-500/50 text-red-400"
              >
                🗑 Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {triggerTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTriggerTarget(null)} />
          <div className="relative w-full max-w-2xl rounded-xl border border-[#1e3a5f] bg-[#0a0f1e] p-4 space-y-3">
            <h3 className="text-white font-semibold">Acionamento do Popup: {triggerTarget.name}</h3>

            <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-[#94a3b8]">Botão</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`<button onclick="agOpenPopup('${triggerTarget.id}')">Texto</button>`)}
                  className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
                >
                  📋 Copiar
                </button>
              </div>
              <code className="text-xs text-[#cbd5e1] font-mono break-all">{`<button onclick="agOpenPopup('${triggerTarget.id}')">Texto</button>`}</code>
            </div>

            <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-[#94a3b8]">JS</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`agOpenPopup('${triggerTarget.id}')`)}
                  className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
                >
                  📋 Copiar
                </button>
              </div>
              <code className="text-xs text-[#cbd5e1] font-mono break-all">{`agOpenPopup('${triggerTarget.id}')`}</code>
            </div>

            <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-[#94a3b8]">Classe</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`class="ag-trigger-popup" data-popup-id="${triggerTarget.id}"`)}
                  className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
                >
                  📋 Copiar
                </button>
              </div>
              <code className="text-xs text-[#cbd5e1] font-mono break-all">{`class="ag-trigger-popup" data-popup-id="${triggerTarget.id}"`}</code>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTriggerTarget(null)}
                className="px-3 py-1.5 rounded-lg border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-4 text-sm text-[#94a3b8] flex flex-wrap gap-4">
        <span>{stats.total} modelos no total</span>
        <span className="text-emerald-400">● {stats.ativos} ativos</span>
        <span className="text-slate-400">○ {stats.inativos} inativos</span>
        <span>🔝 {stats.headers} headers</span>
        <span>🔻 {stats.footers} footers</span>
        <span>💬 {stats.popups} popups</span>
        <span>🃏 {stats.cards} cards</span>
        {isPending && <span className="text-[#0ea5e9]">Atualizando filtros...</span>}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Excluir modelo"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  )
}
