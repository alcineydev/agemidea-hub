import type { Metadata } from 'next'
import Link from 'next/link'

import { PageModels } from '@/components/public/PageModels'
import { getPageByType } from '@/lib/actions/pages'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByType('home')
  if (!page) return {}

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
  }
}

export default async function HomePage() {
  const page = await getPageByType('home')

  if (!page) {
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
        }}
      >
        <h1 style={{ fontSize: '24px' }}>Agemidea Hub</h1>
        <p style={{ color: '#64748b' }}>Nenhuma página inicial configurada.</p>
        <Link href="/login" style={{ color: '#0ea5e9' }}>
          Acessar painel →
        </Link>
      </div>
    )
  }

  return (
    <>
      <PageModels pageId={page.id} position="header" />
      <div dangerouslySetInnerHTML={{ __html: page.html_content || '' }} />
      {page.css_content && <style dangerouslySetInnerHTML={{ __html: page.css_content }} />}
      {page.js_content && <script dangerouslySetInnerHTML={{ __html: page.js_content }} />}
      <PageModels pageId={page.id} position="footer" />
      <PageModels pageId={page.id} position="popup" />
    </>
  )
}
