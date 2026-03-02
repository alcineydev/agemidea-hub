import { cn } from '@/lib/utils'

interface BlogStats {
  total: number
  publicados: number
  rascunhos: number
  agendados: number
  arquivados: number
  viewsTotal: number
  thisMonth: number
}

interface BlogStatsCardsProps {
  stats: BlogStats
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

const cardBase = 'rounded-xl border border-[#1e1e2a] bg-[#111118] p-4'

export default function BlogStatsCards({ stats }: BlogStatsCardsProps) {
  const cards = [
    {
      label: 'Total de artigos',
      value: stats.total,
      icon: '📝',
      iconClass: 'bg-cyan-500/10 text-cyan-400',
    },
    {
      label: 'Publicados',
      value: stats.publicados,
      icon: '✅',
      iconClass: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Views total',
      value: compactNumber(stats.viewsTotal),
      icon: '👁️',
      iconClass: 'bg-violet-500/10 text-violet-400',
    },
    {
      label: 'Criados este mes',
      value: stats.thisMonth,
      icon: '📅',
      iconClass: 'bg-amber-500/10 text-amber-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className={cardBase}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#71717a]">{card.label}</p>
            <span className={cn('rounded-lg px-2 py-1 text-sm', card.iconClass)}>{card.icon}</span>
          </div>
          <p className="text-2xl font-bold text-[#e4e4e7]">{card.value}</p>
        </article>
      ))}
    </div>
  )
}
