import { formatCurrency } from '@/lib/utils'
import type { QuoteStats } from '@/types/quotes'

interface QuoteStatsCardsProps {
  stats: QuoteStats
}

const cardClass = 'rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4'

export default function QuoteStatsCards({ stats }: QuoteStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article className={cardClass}>
        <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
        <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
      </article>
      <article className={cardClass}>
        <p className="text-xs uppercase tracking-wide text-slate-500">Enviados</p>
        <p className="mt-1 text-2xl font-bold text-amber-400">{stats.sent}</p>
      </article>
      <article className={cardClass}>
        <p className="text-xs uppercase tracking-wide text-slate-500">Aprovados</p>
        <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.approved}</p>
      </article>
      <article className={cardClass}>
        <p className="text-xs uppercase tracking-wide text-slate-500">Valor aprovado</p>
        <p className="mt-1 text-2xl font-bold text-cyan-400">
          {formatCurrency(stats.total_approved_value)}
        </p>
      </article>
    </div>
  )
}
