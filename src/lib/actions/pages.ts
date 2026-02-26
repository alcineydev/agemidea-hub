'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

export type PageType = 'home' | 'normal' | '404' | 'blog'
export type PageStatus = 'rascunho' | 'publicada'

export interface PageFormData {
  title: string
  slug: string
  page_type: PageType
  status: PageStatus
  html_content: string
  css_content: string
  js_content: string
  meta_title?: string
  meta_description?: string
  show_in_menu: boolean
  menu_order: number
}

interface PagesFilters {
  type?: string
  search?: string
}

const UNIQUE_TYPES: PageType[] = ['home', '404', 'blog']

export async function getPages(filters?: PagesFilters) {
  const supabase = await createServerClient()

  let query = supabase
    .from('pages')
    .select('*')
    .order('updated_at', { ascending: false })

  if (filters?.type && filters.type !== 'todas') {
    query = query.eq('page_type', filters.type)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPageById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from('pages').select('*').eq('id', id).single()

  if (error) throw new Error(error.message)
  return data
}

export async function getPageBySlug(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publicada')
    .single()

  if (error) return null
  return data
}

export async function getPageByType(type: PageType) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', type)
    .eq('status', 'publicada')
    .single()

  if (error) return null
  return data
}

async function validateUniquePageType(
  page_type: PageType,
  currentId?: string
) {
  if (!UNIQUE_TYPES.includes(page_type)) return

  const supabase = await createServerClient()
  let query = supabase.from('pages').select('id').eq('page_type', page_type)
  if (currentId) query = query.neq('id', currentId)

  const { data } = await query.maybeSingle()
  if (data) {
    const suffix = currentId ? 'Já existe outra página' : 'Já existe uma página'
    throw new Error(`${suffix} do tipo "${page_type}". Só pode ter uma.`)
  }
}

async function validateUniqueSlug(slug: string, pageType: PageType, currentId?: string) {
  if (pageType === 'home' || !slug) return

  const supabase = await createServerClient()
  let query = supabase.from('pages').select('id').eq('slug', slug)
  if (currentId) query = query.neq('id', currentId)

  const { data } = await query.maybeSingle()
  if (data) {
    throw new Error(`O slug "${slug}" já está em uso.`)
  }
}

export async function createPage(formData: PageFormData) {
  const supabase = await createServerClient()

  await validateUniquePageType(formData.page_type)
  await validateUniqueSlug(formData.slug, formData.page_type)

  const { data, error } = await supabase
    .from('pages')
    .insert({
      title: formData.title,
      slug: formData.page_type === 'home' ? '' : formData.slug,
      page_type: formData.page_type,
      status: formData.status,
      html_content: formData.html_content,
      css_content: formData.css_content,
      js_content: formData.js_content,
      meta_title: formData.meta_title || formData.title,
      meta_description: formData.meta_description || '',
      show_in_menu: formData.show_in_menu,
      menu_order: formData.menu_order,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas')
  revalidatePath('/')
  return data
}

export async function updatePage(id: string, formData: PageFormData) {
  const supabase = await createServerClient()

  await validateUniquePageType(formData.page_type, id)
  await validateUniqueSlug(formData.slug, formData.page_type, id)

  const { data, error } = await supabase
    .from('pages')
    .update({
      title: formData.title,
      slug: formData.page_type === 'home' ? '' : formData.slug,
      page_type: formData.page_type,
      status: formData.status,
      html_content: formData.html_content,
      css_content: formData.css_content,
      js_content: formData.js_content,
      meta_title: formData.meta_title || formData.title,
      meta_description: formData.meta_description || '',
      show_in_menu: formData.show_in_menu,
      menu_order: formData.menu_order,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas')
  revalidatePath(`/${formData.slug}`)
  revalidatePath('/')
  return data
}

export async function deletePage(id: string) {
  const supabase = await createServerClient()

  const { data: page } = await supabase.from('pages').select('page_type, slug').eq('id', id).single()

  const { error } = await supabase.from('pages').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas')
  if (page?.slug) {
    revalidatePath(`/${page.slug}`)
  }
  revalidatePath('/')
  return { success: true }
}

export async function getPagesStats() {
  const supabase = await createServerClient()
  const { data: all } = await supabase.from('pages').select('id, status')

  if (!all) return { total: 0, publicadas: 0, rascunhos: 0 }

  return {
    total: all.length,
    publicadas: all.filter((p) => p.status === 'publicada').length,
    rascunhos: all.filter((p) => p.status === 'rascunho').length,
  }
}

export async function seedInitialPagesIfMissing() {
  const supabase = createAdminClient()
  const { data } = await supabase.from('pages').select('id').limit(1)
  return { hasAnyPage: Boolean(data && data.length > 0) }
}
