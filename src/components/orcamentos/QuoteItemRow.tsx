'use client'

interface EditableQuoteItem {
  service_name: string
  description?: string
  quantity: number
  unit_price: number
  discount_percent?: number
  sort_order?: number
}

interface QuoteItemRowProps {
  index: number
  item: EditableQuoteItem
  readOnly?: boolean
  onChange: (patch: Partial<EditableQuoteItem>) => void
  onRemove: () => void
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export default function QuoteItemRow({
  index,
  item,
  readOnly = false,
  onChange,
  onRemove,
}: QuoteItemRowProps) {
  const quantity = Number(item.quantity ?? 0)
  const unitPrice = Number(item.unit_price ?? 0)
  const discountPercent = Number(item.discount_percent ?? 0)
  const subtotal = quantity * unitPrice * (1 - discountPercent / 100)

  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40 disabled:opacity-60'

  return (
    <div className="rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md bg-cyan-500/10 px-2 py-1 text-[11px] font-bold tracking-wide text-cyan-300">
          ITEM {String(index + 1).padStart(2, '0')}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-500/20 px-2 py-1 text-xs font-semibold text-red-400"
          >
            Remover
          </button>
        )}
      </div>

      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-500">Servico</span>
          <input
            value={item.service_name}
            onChange={(event) => onChange({ service_name: event.target.value })}
            className={inputClass}
            disabled={readOnly}
            placeholder="Ex: Landing page institucional"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-500">Descricao</span>
          <textarea
            value={item.description ?? ''}
            onChange={(event) => onChange({ description: event.target.value })}
            className={`${inputClass} min-h-20 resize-y`}
            disabled={readOnly}
            placeholder="Escopo detalhado do servico..."
          />
        </label>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Qtd</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.quantity}
              onChange={(event) => onChange({ quantity: toNumber(event.target.value, 1) })}
              className={inputClass}
              disabled={readOnly}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Valor unit.</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.unit_price}
              onChange={(event) => onChange({ unit_price: toNumber(event.target.value) })}
              className={inputClass}
              disabled={readOnly}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Desconto %</span>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={item.discount_percent ?? 0}
              onChange={(event) => onChange({ discount_percent: toNumber(event.target.value) })}
              className={inputClass}
              disabled={readOnly}
            />
          </label>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Subtotal</span>
            <div className="rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/40 px-3 py-2 text-sm font-semibold text-cyan-300">
              R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
