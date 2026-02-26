import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Proteger /painel (precisa estar logado) ──
  if (pathname.startsWith('/painel')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Verificar se perfil existe e está ativo
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    if (!profile || !profile.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Bloquear rotas admin para clientes
    const adminOnlyRoutes = ['/painel/clientes', '/painel/paginas', '/painel/blog', '/painel/configuracoes']
    const isAdminRoute = adminOnlyRoutes.some((route) => pathname.startsWith(route))

    if (isAdminRoute && profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/painel'
      return NextResponse.redirect(url)
    }
  }

  // ── Se logado e acessou /login, redireciona para /painel ──
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/painel'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
