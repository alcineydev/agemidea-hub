'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { ModelRecord } from '@/lib/actions/models'
import type { Page } from '@/types'
import { ModelsListClient } from '../modelos/_components/models-list-client'
import { PagesListClient } from './pages-list-client'

interface PagesModelsTabsProps {
  pages: Page[]
  models: ModelRecord[]
  initialTab: 'pages' | 'models'
}

export function PagesModelsTabs({ pages, models, initialTab }: PagesModelsTabsProps) {
  const [activeTab, setActiveTab] = useState<'pages' | 'models'>(initialTab)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex border-b border-[#1e3a5f]/20 bg-[#050510]/50 sticky top-0 z-10">
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-1.5 px-6 py-3.5 text-[13px] font-medium border-b-2 transition-all ${
              activeTab === 'pages'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-600 border-transparent hover:text-slate-400'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Páginas
            <span className="text-[11px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">
              {pages.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-1.5 px-6 py-3.5 text-[13px] font-medium border-b-2 transition-all ${
              activeTab === 'models'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-600 border-transparent hover:text-slate-400'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Modelos
            <span className="text-[11px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">
              {models.length}
            </span>
          </button>
        </div>

        <Link
          href={activeTab === 'pages' ? '/painel/paginas/nova' : '/painel/paginas/modelos/novo'}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {activeTab === 'pages' ? 'Nova Página' : 'Novo Modelo'}
        </Link>
      </div>

      {activeTab === 'pages' ? <PagesListClient pages={pages} /> : <ModelsListClient models={models} />}
    </div>
  )
}
