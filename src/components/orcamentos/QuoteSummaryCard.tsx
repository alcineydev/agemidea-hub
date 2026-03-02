import { formatCurrency } from '@/lib/utils'

interface QuoteSummaryCardProps {
  subtotal: number
  discount: number
  total: number
}

export default function QuoteSummaryCard({ subtotal, discount, total }: QuoteSummaryCardProps) {
  return (
    <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Resumo</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Descontos</span>
          <strong className="text-amber-400">- {formatCurrency(discount)}</strong>
        </div>
        <div className="my-2 border-t border-[#1e3a5f]/20" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200">TOTAL</span>
          <strong className="text-xl font-bold text-cyan-300">{formatCurrency(total)}</strong>
        </div>
      </div>
    </section>
  )
}
