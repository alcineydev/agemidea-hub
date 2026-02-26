import Link from 'next/link'
import { Suspense } from 'react'

import { getModels, getModelsStats } from '@/lib/actions/models'
import { ModelsListClient } from './_components/models-list-client'

interface ModelsPageProps {
  searchParams: Promise<{
    type?: string
    search?: string
    status?: string
  }>
}

export default async function ModelosPage({ searchParams }: ModelsPageProps) {
  const params = await searchParams
  const type = params.type ?? 'todos'
  const search = params.search ?? ''
  const status = params.status ?? 'todos'

  const [models, stats] = await Promise.all([
    getModels({ type, search, status }),
    getModelsStats(),
  ])

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🧩 Modelos</h1>
          <p className="text-[#94a3b8]">Templates reutilizáveis para Header, Footer, Popups e Cards</p>
        </div>
        <Link
          href="/painel/paginas/modelos/novo"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          + Novo Modelo
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-8 text-center text-[#94a3b8]">
            Carregando modelos...
          </div>
        }
      >
        <ModelsListClient models={models} stats={stats} />
      </Suspense>
    </div>
  )
}
