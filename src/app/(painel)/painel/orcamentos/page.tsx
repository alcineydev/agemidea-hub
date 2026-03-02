import Link from 'next/link'

import QuoteFilters from '@/components/orcamentos/QuoteFilters'
import QuotesTable from '@/components/orcamentos/QuotesTable'
import QuoteStatsCards from '@/components/orcamentos/QuoteStatsCards'
import {
  getQuotes,
  getQuoteStats,
} from './_actions'
import type { QuoteStatus } from '@/types/quotes'

interface PageProps {
  searchParams: Promise<{
    status?: QuoteStatus
    search?: string
    page?: string
  }>
}

export default async function OrcamentosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const status = params.status && ['draft', 'sent', 'approved', 'rejected'].includes(params.status)
    ? params.status
    : undefined
  const search = params.search?.trim() || undefined

  const [stats, result] = await Promise.all([
    getQuoteStats(),
    getQuotes({
      status,
      search,
      page: Number.isNaN(page) || page < 1 ? 1 : page,
      perPage: 20,
    }),
  ])

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Todos os Orcamentos</h1>
          <p className="text-sm text-slate-500">Gestao completa do funil comercial.</p>
        </div>
        <Link
          href="/painel/orcamentos/novo"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Novo Orcamento
        </Link>
      </header>

      <QuoteStatsCards stats={stats} />

      <QuoteFilters initialSearch={search ?? ''} initialStatus={status ?? 'all'} />

      <QuotesTable quotes={result.data} total={result.total} currentPage={Number.isNaN(page) ? 1 : page} />
    </div>
  )
}
