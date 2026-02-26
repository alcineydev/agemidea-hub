import Link from 'next/link'
import { getPageByType } from '@/lib/actions/pages'

export default async function NotFound() {
  const page = await getPageByType('404')

  if (page) {
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: page.html_content || '' }} />
        {page.css_content && <style dangerouslySetInnerHTML={{ __html: page.css_content }} />}
        {page.js_content && <script dangerouslySetInnerHTML={{ __html: page.js_content }} />}
      </>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050510',
        color: '#fff',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '72px',
          fontWeight: '800',
          background: 'linear-gradient(to right, #0ea5e9, #2563eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        404
      </h1>
      <p style={{ color: '#64748b', fontSize: '18px' }}>Página não encontrada</p>
      <Link href="/" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
        ← Voltar ao início
      </Link>
    </div>
  )
}
