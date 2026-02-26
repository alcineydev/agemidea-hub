import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageModels } from '@/components/public/PageModels'
import { getPageBySlug } from '@/lib/actions/pages'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) return {}

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
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
