'use client'

interface BulkActionBarProps {
  count: number
  type: 'pages' | 'models'
  onPublish: () => void
  onDraft: () => void
  onDelete: () => void
  onClear: () => void
}

export function BulkActionBar({ count, type, onPublish, onDraft, onDelete, onClear }: BulkActionBarProps) {
  if (count <= 0) return null

  const primaryLabel = type === 'pages' ? 'Publicar' : 'Ativar'
  const secondaryLabel = type === 'pages' ? 'Rascunho' : 'Desativar'

  const bulkBtnClass = 'flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-md border transition-all'

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-4 bg-cyan-500/[.04] border border-cyan-500/[.12] rounded-[10px]">
      <span className="text-[13px] font-semibold text-cyan-400">
        {count} {type === 'pages' ? 'selecionadas' : 'selecionados'}
      </span>
      <div className="w-px h-5 bg-[#1e3a5f]/20" />

      <button onClick={onPublish} className={`${bulkBtnClass} border-[#1e3a5f]/20 text-slate-500 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/6`}>
        {primaryLabel}
      </button>
      <button onClick={onDraft} className={`${bulkBtnClass} border-[#1e3a5f]/20 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/6`}>
        {secondaryLabel}
      </button>
      <button
        onClick={onDelete}
        className={`${bulkBtnClass} text-slate-500 border-red-500/15 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/6`}
      >
        Excluir
      </button>
      <button onClick={onClear} className="ml-auto text-[12px] text-slate-600 hover:text-slate-400">
        Limpar seleção
      </button>
    </div>
  )
}
