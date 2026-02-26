import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabase()

  const { data: page } = await supabase
    .from('pages')
    .select('meta_title, meta_description, title')
    .eq('slug', slug)
    .eq('status', 'publicada')
    .eq('page_type', 'normal')
    .single()

  if (!page) return {}

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabase()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publicada')
    .eq('page_type', 'normal')
    .single()

  if (!page) {
    notFound()
  }

  return (
    <>
      {page.css_content && (
        <style dangerouslySetInnerHTML={{ __html: page.css_content }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: page.html_content }} />
      {page.js_content && (
        <script dangerouslySetInnerHTML={{ __html: page.js_content }} />
      )}
    </>
  )
}
