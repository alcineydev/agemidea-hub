import { Suspense } from 'react'

import { getModels } from '@/lib/actions/models'
import { getPages } from '@/lib/actions/pages'
import { PagesModelsTabs } from './_components/pages-models-tabs'

interface PageProps {
  searchParams: Promise<{
    tab?: 'pages' | 'models'
  }>
}

export default async function PaginasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const activeTab = params.tab === 'models' ? 'models' : 'pages'

  const [pages, models] = await Promise.all([
    getPages(),
    getModels(),
  ])

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Páginas e Modelos</h1>
        <p className="text-[#94a3b8]">Gerencie conteúdo e componentes reutilizáveis em um único fluxo.</p>
      </div>

      <Suspense
        fallback={
          <div className="bg-[#0a0f1e] border border-[#1e3a5f]/70 rounded-xl p-8 text-center text-[#94a3b8]">
            Carregando páginas...
          </div>
        }
      >
        <PagesModelsTabs
          pages={pages}
          models={models}
          initialTab={activeTab}
        />
      </Suspense>
    </div>
  )
}
