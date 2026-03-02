'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import Pagination from '@/components/ui/Pagination'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { QuoteListItem } from '@/types/quotes'
import QuoteStatusBadge from './QuoteStatusBadge'

interface QuotesTableProps {
  quotes: QuoteListItem[]
  total: number
  currentPage: number
  perPage?: number
}

export default function QuotesTable({
  quotes,
  total,
  currentPage,
  perPage = 20,
}: QuotesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) params.delete('page')
    else params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleCopyLink = async (publicToken?: string | null) => {
    if (!publicToken) {
      toast.error('Orcamento sem link publico.')
      return
    }

    const origin = window.location.origin
    const url = `${origin}/orcamento/${publicToken}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link publico copiado.')
    } catch {
      toast.error('Nao foi possivel copiar o link.')
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#1e3a5f]/20 bg-[#050510]/40">
              {['Numero', 'Cliente', 'Valor', 'Criado em', 'Validade', 'Status', 'Acoes'].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  Nenhum orcamento encontrado para os filtros selecionados.
                </td>
              </tr>
            )}

            {quotes.map((quote) => (
              <tr key={quote.id} className="border-b border-[#1e3a5f]/10 last:border-0 hover:bg-[#1e3a5f]/10">
                <td className="px-4 py-3 text-sm font-semibold text-cyan-300">{quote.quote_number}</td>
                <td className="px-4 py-3 text-sm text-slate-200">
                  <p>{quote.client?.name ?? '-'}</p>
                  <p className="text-xs text-slate-500">{quote.title || 'Sem titulo'}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-200">{formatCurrency(Number(quote.total ?? 0))}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDate(quote.created_at)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {quote.valid_until ? formatDate(quote.valid_until) : '-'}
                </td>
                <td className="px-4 py-3">
                  <QuoteStatusBadge status={quote.status} compact />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/painel/orcamentos/${quote.id}`}
                      className="inline-flex h-8 items-center rounded-md border border-[#1e3a5f]/30 px-2 text-xs text-slate-400 hover:text-white"
                    >
                      Ver
                    </Link>
                    <a
                      href={`/api/quotes/${quote.id}/pdf`}
                      target="_blank"
                      className="inline-flex h-8 items-center rounded-md border border-[#1e3a5f]/30 px-2 text-xs text-slate-400 hover:text-white"
                      rel="noreferrer"
                    >
                      PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleCopyLink(quote.public_token)}
                      className="inline-flex h-8 items-center rounded-md border border-[#1e3a5f]/30 px-2 text-xs text-slate-400 hover:text-white"
                    >
                      Link
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end border-t border-[#1e3a5f]/20 bg-[#050510]/40 px-4 py-3">
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={perPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
