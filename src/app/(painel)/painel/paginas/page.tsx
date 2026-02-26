import { Suspense } from 'react'
import Link from 'next/link'

import { getPages, getPagesStats } from '@/lib/actions/pages'
import { PagesListClient } from './_components/pages-list-client'

interface PageProps {
  searchParams: Promise<{
    type?: string
    search?: string
  }>
}

export default async function PaginasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const type = params.type ?? 'todas'
  const search = params.search ?? ''

  const [pages, stats] = await Promise.all([
    getPages({ type, search }),
    getPagesStats(),
  ])

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📄 Páginas</h1>
          <p className="text-[#94a3b8]">Gerencie todas as páginas do site</p>
        </div>
        <Link
          href="/painel/paginas/nova"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          ＋ Nova Página
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-8 text-center text-[#94a3b8]">
            Carregando páginas...
          </div>
        }
      >
        <PagesListClient pages={pages} stats={stats} />
      </Suspense>
    </div>
  )
}
