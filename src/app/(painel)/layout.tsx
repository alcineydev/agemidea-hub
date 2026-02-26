import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#050510]">
      <aside className="w-64 bg-[#0a0f1e] border-r border-[#1e3a5f]/30 p-6 hidden lg:block relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/25">
            A
          </div>
          <div>
            <span className="text-sm font-bold text-white">AGEMIDEA</span>
            <span className="text-[9px] text-cyan-400/70 uppercase tracking-widest block">Hub</span>
          </div>
        </div>
        <nav className="space-y-1">
          <Link href="/painel" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
            📊 Dashboard
          </Link>
          {profile.role === 'admin' && (
            <>
              <Link href="/painel/clientes" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
                👥 Clientes
              </Link>
              <Link href="/painel/paginas" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
                📄 Páginas
              </Link>
              <div className="ml-6 -mt-1 mb-1 space-y-1">
                <Link
                  href="/painel/paginas"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-300 px-2 py-1 rounded-md hover:bg-[#1e3a5f]/20 transition-colors"
                >
                  ├── Todas as Páginas
                </Link>
                <Link
                  href="/painel/paginas/nova"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-300 px-2 py-1 rounded-md hover:bg-[#1e3a5f]/20 transition-colors"
                >
                  ├── Criar Nova
                </Link>
                <Link
                  href="/painel/paginas/modelos"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-300 px-2 py-1 rounded-md hover:bg-[#1e3a5f]/20 transition-colors"
                >
                  ├── 🧩 Modelos
                </Link>
                <Link
                  href="/painel/paginas/modelos/novo"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-cyan-300 px-2 py-1 rounded-md hover:bg-[#1e3a5f]/20 transition-colors"
                >
                  └── Criar Modelo
                </Link>
              </div>
              <Link href="/painel/blog" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
                📝 Blog
              </Link>
            </>
          )}
          <Link href="/painel/projetos" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
            📁 Projetos
          </Link>
          <Link href="/painel/suporte" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
            💬 Suporte
          </Link>
          {profile.role === 'client' && (
            <Link href="/painel/arquivos" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
              📂 Arquivos
            </Link>
          )}
          {profile.role === 'admin' && (
            <Link href="/painel/configuracoes" className="flex items-center gap-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#1e3a5f]/20 text-sm transition-colors">
              ⚙️ Configurações
            </Link>
          )}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#050510] border border-[#1e3a5f]/20">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-lg flex items-center justify-center text-xs font-bold text-cyan-400">
              {profile.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile.name}</p>
              <p className="text-[10px] text-gray-500 truncate">
                {profile.role === 'admin' ? 'Administrador' : 'Cliente'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
