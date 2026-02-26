import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/server'

const SEED_PAGES = [
  {
    title: 'Home — Agemidea',
    slug: '',
    page_type: 'home',
    status: 'rascunho',
    html_content: `<section style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#050510,#0a0f1e);padding:40px;">
  <div style="text-align:center;max-width:800px;">
    <h1 style="font-size:3rem;font-weight:800;background:linear-gradient(to right,#0ea5e9,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;">Transformamos Empresas em Potências Digitais</h1>
    <p style="color:#94a3b8;font-size:1.2rem;margin-bottom:32px;">Marketing digital de alta performance, desenvolvimento web e soluções tecnológicas para escalar seu negócio.</p>
    <a href="https://wa.me/5566992497137" target="_blank" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem;">Solicitar Orçamento</a>
  </div>
</section>`,
    css_content: `body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#050510;color:#fff;}`,
    js_content: '',
    meta_title: 'Agemidea — Transformamos Empresas em Potências Digitais',
    meta_description:
      'Agência de marketing digital e desenvolvimento web. Estratégia, criação e alta performance para sua empresa.',
    show_in_menu: false,
    menu_order: 0,
  },
  {
    title: 'Política de Privacidade',
    slug: 'politica-de-privacidade',
    page_type: 'normal',
    status: 'rascunho',
    html_content: `<div style="max-width:800px;margin:0 auto;padding:60px 20px;">
  <h1 style="font-size:2rem;font-weight:700;color:#fff;margin-bottom:24px;">Política de Privacidade</h1>
  <p style="color:#94a3b8;line-height:1.8;">Esta Política de Privacidade descreve como a Agemidea coleta, usa e compartilha informações pessoais quando você utiliza nossos serviços.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">1. Informações Coletadas</h2>
  <p style="color:#94a3b8;line-height:1.8;">Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone e empresa, ao preencher formulários de contato ou criar uma conta.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">2. Uso das Informações</h2>
  <p style="color:#94a3b8;line-height:1.8;">Utilizamos suas informações para fornecer nossos serviços, comunicar atualizações, melhorar a experiência do usuário e cumprir obrigações legais.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">3. Contato</h2>
  <p style="color:#94a3b8;line-height:1.8;">Para dúvidas sobre esta política, entre em contato: suporte@agemidea.com.br</p>
</div>`,
    css_content: `body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#050510;color:#fff;}`,
    js_content: '',
    meta_title: 'Política de Privacidade — Agemidea',
    meta_description: 'Saiba como a Agemidea coleta, usa e protege suas informações pessoais.',
    show_in_menu: true,
    menu_order: 90,
  },
  {
    title: 'Termos de Uso',
    slug: 'termos-de-uso',
    page_type: 'normal',
    status: 'rascunho',
    html_content: `<div style="max-width:800px;margin:0 auto;padding:60px 20px;">
  <h1 style="font-size:2rem;font-weight:700;color:#fff;margin-bottom:24px;">Termos de Uso</h1>
  <p style="color:#94a3b8;line-height:1.8;">Ao acessar e utilizar os serviços da Agemidea, você concorda com os seguintes termos e condições.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">1. Aceitação dos Termos</h2>
  <p style="color:#94a3b8;line-height:1.8;">O uso dos nossos serviços implica na aceitação integral destes termos. Caso não concorde, não utilize nossos serviços.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">2. Serviços</h2>
  <p style="color:#94a3b8;line-height:1.8;">A Agemidea oferece serviços de marketing digital, desenvolvimento web, criação de sistemas e soluções tecnológicas.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">3. Contato</h2>
  <p style="color:#94a3b8;line-height:1.8;">Dúvidas: suporte@agemidea.com.br</p>
</div>`,
    css_content: `body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#050510;color:#fff;}`,
    js_content: '',
    meta_title: 'Termos de Uso — Agemidea',
    meta_description: 'Termos e condições de uso dos serviços da Agemidea.',
    show_in_menu: true,
    menu_order: 91,
  },
  {
    title: 'Política de Cookies',
    slug: 'politica-de-cookies',
    page_type: 'normal',
    status: 'rascunho',
    html_content: `<div style="max-width:800px;margin:0 auto;padding:60px 20px;">
  <h1 style="font-size:2rem;font-weight:700;color:#fff;margin-bottom:24px;">Política de Cookies</h1>
  <p style="color:#94a3b8;line-height:1.8;">Este site utiliza cookies para melhorar sua experiência de navegação.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">1. O que são Cookies?</h2>
  <p style="color:#94a3b8;line-height:1.8;">Cookies são pequenos arquivos de texto armazenados no seu navegador que permitem ao site reconhecer seu dispositivo.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">2. Tipos de Cookies Utilizados</h2>
  <p style="color:#94a3b8;line-height:1.8;">Utilizamos cookies essenciais para o funcionamento do site, cookies de análise para entender o uso e cookies de preferência para personalização.</p>
  <h2 style="color:#0ea5e9;margin-top:32px;">3. Contato</h2>
  <p style="color:#94a3b8;line-height:1.8;">Dúvidas: suporte@agemidea.com.br</p>
</div>`,
    css_content: `body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#050510;color:#fff;}`,
    js_content: '',
    meta_title: 'Política de Cookies — Agemidea',
    meta_description: 'Saiba como a Agemidea utiliza cookies para melhorar sua experiência.',
    show_in_menu: true,
    menu_order: 92,
  },
  {
    title: 'Página Não Encontrada',
    slug: '404',
    page_type: '404',
    status: 'publicada',
    html_content: `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050510;color:#fff;flex-direction:column;gap:16px;text-align:center;padding:40px;">
  <h1 style="font-size:6rem;font-weight:800;background:linear-gradient(to right,#0ea5e9,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;line-height:1;">404</h1>
  <p style="color:#64748b;font-size:1.2rem;">Ops! Esta página não foi encontrada.</p>
  <a href="/" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">← Voltar ao Início</a>
</div>`,
    css_content: `body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#050510;}`,
    js_content: '',
    meta_title: '404 — Página não encontrada',
    meta_description: '',
    show_in_menu: false,
    menu_order: 0,
  },
] as const

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results: Array<{ title: string; status: string }> = []

  for (const page of SEED_PAGES) {
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .or(`slug.eq.${page.slug},page_type.eq.${page.page_type}`)
      .limit(1)

    if (existing && existing.length > 0) {
      results.push({ title: page.title, status: 'skipped (já existe)' })
      continue
    }

    const { error } = await supabase.from('pages').insert(page)
    if (error) {
      results.push({ title: page.title, status: `error: ${error.message}` })
    } else {
      results.push({ title: page.title, status: 'created' })
    }
  }

  return NextResponse.json({ success: true, results })
}
