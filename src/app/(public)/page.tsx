import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createServerSupabase()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', 'home')
    .eq('status', 'publicada')
    .single()

  if (!page) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center tech-grid">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-cyan-500/25">
            A
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Agemidea Hub</h1>
          <p className="text-gray-500 mb-6">Em breve, uma nova experiência digital.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            Acessar painel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {page.css_content && <style dangerouslySetInnerHTML={{ __html: page.css_content }} />}
      <div dangerouslySetInnerHTML={{ __html: page.html_content }} />
      {page.js_content && <script dangerouslySetInnerHTML={{ __html: page.js_content }} />}
    </>
  )
}
