'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { DynamicLogo } from './DynamicLogo'

interface PainelSidebarProps {
  userName: string
  userRole: 'admin' | 'client'
}

function NavIcon({ children, active }: { children: React.ReactNode; active: boolean }) {
  return <span className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'opacity-100 text-cyan-400' : 'opacity-60'}`}>{children}</span>
}

export function PainelSidebar({ userName, userRole }: PainelSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [configFlyoutOpen, setConfigFlyoutOpen] = useState(false)
  const flyoutRef = useRef<HTMLDivElement>(null)
  const configFlyoutRef = useRef<HTMLDivElement>(null)

  const isAdmin = userRole === 'admin'

  useEffect(() => {
    if (!flyoutOpen && !configFlyoutOpen) return
    const handler = (event: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        setFlyoutOpen(false)
      }
      if (configFlyoutRef.current && !configFlyoutRef.current.contains(event.target as Node)) {
        setConfigFlyoutOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [flyoutOpen, configFlyoutOpen])

  const baseItemClass =
    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-all duration-150'

  const getItemClass = (active: boolean) =>
    `${baseItemClass} ${
      active ? 'text-cyan-400 bg-cyan-500/[.07]' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/[.12]'
    }`

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex w-[220px] bg-[#050510] border-r border-[#1e3a5f]/20 flex-col h-screen fixed left-0 top-0 z-50 overflow-visible">
      <div className="px-4 pt-4 pb-3">
        <DynamicLogo
          className="items-center"
          imgClassName="h-8 w-auto object-contain max-w-[160px]"
          fallbackText="AGEMIDEA"
          fallbackBadge="HUB"
          showBadge
          showIcon
        />
      </div>

      <nav className="px-2 space-y-1">
        <Link href="/painel" className={getItemClass(pathname === '/painel')}>
          <NavIcon active={pathname === '/painel'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </NavIcon>
          Dashboard
        </Link>

        {isAdmin && (
          <>
            <div ref={flyoutRef} className="relative z-[200]">
              <button
                onClick={() => setFlyoutOpen((prev) => !prev)}
                className={`w-full ${getItemClass(pathname.startsWith('/painel/paginas'))}`}
              >
                <NavIcon active={pathname.startsWith('/painel/paginas')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </NavIcon>
                Páginas
                <svg className="ml-auto w-3.5 h-3.5 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {flyoutOpen && (
                <div className="absolute left-[calc(100%+8px)] top-[-6px] w-[200px] bg-[#0c1020] border border-[#1e3a5f]/30 rounded-[10px] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,.5)] z-[999]">
                  <div className="text-[10px] font-bold text-slate-700 tracking-wider uppercase px-2.5 pt-2 pb-1.5">Páginas</div>
                  <Link
                    href="/painel/paginas"
                    onClick={() => setFlyoutOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/[.15] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 6h16" />
                      <path d="M4 12h16" />
                      <path d="M4 18h10" />
                    </svg>
                    Todas as Páginas
                  </Link>
                  <Link
                    href="/painel/paginas/nova"
                    onClick={() => setFlyoutOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/[.15] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Criar Nova
                  </Link>
                  <div className="h-px bg-[#1e3a5f]/15 mx-2 my-1" />
                  <div className="text-[10px] font-bold text-slate-700 tracking-wider uppercase px-2.5 pt-2 pb-1.5">Modelos</div>
                  <Link
                    href="/painel/paginas/modelos"
                    onClick={() => setFlyoutOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/[.15] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    Ver Modelos
                  </Link>
                  <Link
                    href="/painel/paginas/modelos/novo"
                    onClick={() => setFlyoutOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/[.15] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Criar Modelo
                  </Link>
                </div>
              )}
            </div>

            <Link href="/painel/midia" className={getItemClass(pathname.startsWith('/painel/midia'))}>
              <NavIcon active={pathname.startsWith('/painel/midia')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <polyline points="21 15 16 11 7 20" />
                </svg>
              </NavIcon>
              Mídia
            </Link>

            <Link href="/painel/clientes" className={getItemClass(pathname.startsWith('/painel/clientes'))}>
              <NavIcon active={pathname.startsWith('/painel/clientes')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </NavIcon>
              Clientes
            </Link>

            <Link href="/painel/blog" className={getItemClass(pathname.startsWith('/painel/blog'))}>
              <NavIcon active={pathname.startsWith('/painel/blog')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </NavIcon>
              Blog
            </Link>
          </>
        )}

        <Link href="/painel/projetos" className={getItemClass(pathname.startsWith('/painel/projetos'))}>
          <NavIcon active={pathname.startsWith('/painel/projetos')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </NavIcon>
          Projetos
        </Link>

        <Link href="/painel/suporte" className={getItemClass(pathname.startsWith('/painel/suporte'))}>
          <NavIcon active={pathname.startsWith('/painel/suporte')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
              <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
              <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
            </svg>
          </NavIcon>
          Suporte
        </Link>

        {isAdmin && (
          <div ref={configFlyoutRef} className="relative z-[200]">
            <button
              onClick={() => setConfigFlyoutOpen((prev) => !prev)}
              className={`w-full ${getItemClass(pathname.startsWith('/painel/configuracoes'))}`}
            >
              <NavIcon active={pathname.startsWith('/painel/configuracoes')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </NavIcon>
              Configurações
              <svg className="ml-auto w-3.5 h-3.5 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {configFlyoutOpen && (
              <div className="absolute left-[calc(100%+8px)] top-[-6px] w-[210px] bg-[#0c1020] border border-[#1e3a5f]/30 rounded-[10px] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,.5)] z-[999]">
                <div className="text-[10px] font-bold text-slate-700 tracking-wider uppercase px-2.5 pt-2 pb-1.5">Configurações</div>
                <Link
                  href="/painel/configuracoes?tab=visual"
                  onClick={() => setConfigFlyoutOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/[.15] transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82" />
                    <path d="M4.6 9a1.65 1.65 0 00-.33-1.82" />
                  </svg>
                  Identidade Visual
                </Link>
                <Link
                  href="/painel/configuracoes?tab=empresa"
                  onClick={() => setConfigFlyoutOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/[.15] transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 21h18" />
                    <path d="M5 21V7l8-4v18" />
                    <path d="M19 21V11l-6-4" />
                  </svg>
                  Informações
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="border-t border-[#1e3a5f]/[.12] p-2 mt-auto">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {userName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-slate-200 truncate">{userName}</div>
            <div className="text-[10.5px] text-slate-600">{userRole === 'admin' ? 'Administrador' : 'Cliente'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[12.5px] text-slate-500 hover:text-red-400 hover:bg-red-400/[.06] transition-all mt-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
