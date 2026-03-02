import { QUOTE_STATUS_CONFIG, type QuoteStatus } from '@/types/quotes'

interface QuoteStatusBadgeProps {
  status: QuoteStatus
  compact?: boolean
}

export default function QuoteStatusBadge({ status, compact = false }: QuoteStatusBadgeProps) {
  const config = QUOTE_STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      {config.label}
    </span>
  )
}
