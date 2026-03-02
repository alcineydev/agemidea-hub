'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache'

import { createAdminClient, createServerSupabase } from '@/lib/supabase/server'
import { blogCategorySchema, blogPostSchema } from '@/lib/validations'

interface BlogPostInput {
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image_url?: string
  cover_image_alt?: string
  category_id?: string
  status: 'rascunho' | 'publicado' | 'agendado' | 'arquivado'
  meta_title?: string
  meta_description?: string
  focus_keyword?: string
  og_title?: string
  og_description?: string
  og_image_url?: string
  published_at?: string
  scheduled_for?: string
  tag_ids?: string[]
}

interface CategoryInput {
  name: string
  slug: string
  description?: string
  color?: string
  meta_title?: string
  meta_description?: string
  cover_image_url?: string
}

interface ActionResult<T = null> {
  success: boolean
  data?: T
  error?: string
}

interface BlogTagRow {
  id: string
  name: string
  slug: string
}

interface BlogCategoryRow {
  id: string
  name: string
  slug: string
  color: string | null
  description: string | null
  meta_title: string | null
  meta_description: string | null
  cover_image_url: string | null
  order_index: number
  created_at: string
}

interface PostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  cover_image_alt: string | null
  category_id: string | null
  author_id: string
  status: 'rascunho' | 'publicado' | 'agendado' | 'arquivado'
  meta_title: string | null
  meta_description: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  focus_keyword: string | null
  published_at: string | null
  scheduled_for: string | null
  views_count: number
  created_at: string
  updated_at: string
  category?: BlogCategoryRow | BlogCategoryRow[] | null
  author?: {
    id: string
    name: string
    avatar_url: string | null
  } | Array<{
    id: string
    name: string
    avatar_url: string | null
  }> | null
  tags?: Array<{
    tag?: BlogTagRow | BlogTagRow[] | null
  }> | null
}

function normalizeSingle<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function normalizeTags(tags: PostRow['tags']) {
  if (!tags?.length) return []
  return tags
    .map((item) => normalizeSingle(item.tag))
    .filter((tag): tag is BlogTagRow => Boolean(tag))
}

function normalizePost(post: PostRow) {
  return {
    ...post,
    category: normalizeSingle(post.category),
    author: normalizeSingle(post.author),
    tags: normalizeTags(post.tags),
  }
}

async function getAdminProfile() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return profile
}

export async function getPosts(params?: {
  status?: string
  search?: string
  page?: number
  perPage?: number
}): Promise<ActionResult<{ posts: ReturnType<typeof normalizePost>[]; total: number }>> {
  try {
    const supabase = await createServerSupabase()
    const page = params?.page ?? 1
    const perPage = params?.perPage ?? 20
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let query = supabase
      .from('blog_posts')
      .select(
        `
        *,
        category:blog_categories(id, name, slug, color, description, meta_title, meta_description, cover_image_url, order_index, created_at),
        author:profiles!author_id(id, name, avatar_url),
        tags:blog_post_tags(
          tag:blog_tags(id, name, slug)
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params?.status && params.status !== 'todos') {
      query = query.eq('status', params.status)
    }

    if (params?.search?.trim()) {
      const s = params.search.trim()
      query = query.or(`title.ilike.%${s}%,slug.ilike.%${s}%`)
    }

    const { data, error, count } = await query
    if (error) return { success: false, error: error.message }

    const posts = ((data ?? []) as PostRow[]).map(normalizePost)
    return { success: true, data: { posts, total: count ?? 0 } }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getPostById(id: string): Promise<ActionResult<ReturnType<typeof normalizePost>>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        category:blog_categories(id, name, slug, color, description, meta_title, meta_description, cover_image_url, order_index, created_at),
        author:profiles!author_id(id, name, avatar_url),
        tags:blog_post_tags(
          tag:blog_tags(id, name, slug)
        )
      `
      )
      .eq('id', id)
      .single()

    if (error || !data) return { success: false, error: error?.message ?? 'Artigo nao encontrado' }
    return { success: true, data: normalizePost(data as PostRow) }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createPost(input: BlogPostInput): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }
    const parsed = blogPostSchema.safeParse(input)
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(' | ')
      return { success: false, error: message || 'Dados invalidos.' }
    }

    const supabase = await createServerSupabase()
    const payload = parsed.data
    const postData: Record<string, unknown> = {
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt || null,
      content: payload.content,
      cover_image_url: payload.cover_image_url || null,
      cover_image_alt: payload.cover_image_alt || null,
      category_id: payload.category_id || null,
      author_id: profile.id,
      status: payload.status,
      meta_title: payload.meta_title || null,
      meta_description: payload.meta_description || null,
      focus_keyword: payload.focus_keyword || null,
      og_title: payload.og_title || null,
      og_description: payload.og_description || null,
      og_image_url: payload.og_image_url || null,
    }

    if (payload.status === 'publicado' && !payload.published_at) {
      postData.published_at = new Date().toISOString()
    } else if (payload.published_at) {
      postData.published_at = payload.published_at
    }

    if (payload.status === 'agendado' && payload.scheduled_for) {
      postData.scheduled_for = payload.scheduled_for
    } else {
      postData.scheduled_for = null
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select('id')
      .single()

    if (error || !data) return { success: false, error: error?.message ?? 'Erro ao criar post' }

    if (payload.tag_ids?.length) {
      const tagRelations = payload.tag_ids.map((tagId) => ({
        post_id: data.id,
        tag_id: tagId,
      }))
      await supabase.from('blog_post_tags').insert(tagRelations)
    }

    revalidatePath('/painel/blog')
    revalidatePath('/painel/blog/novo')
    revalidatePath('/blog')
    return { success: true, data: { id: data.id } }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updatePost(id: string, input: BlogPostInput): Promise<ActionResult> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }
    const parsed = blogPostSchema.safeParse(input)
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(' | ')
      return { success: false, error: message || 'Dados invalidos.' }
    }

    const supabase = await createServerSupabase()
    const payload = parsed.data
    const postData: Record<string, unknown> = {
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt || null,
      content: payload.content,
      cover_image_url: payload.cover_image_url || null,
      cover_image_alt: payload.cover_image_alt || null,
      category_id: payload.category_id || null,
      status: payload.status,
      meta_title: payload.meta_title || null,
      meta_description: payload.meta_description || null,
      focus_keyword: payload.focus_keyword || null,
      og_title: payload.og_title || null,
      og_description: payload.og_description || null,
      og_image_url: payload.og_image_url || null,
      updated_at: new Date().toISOString(),
    }

    if (payload.status === 'publicado' && !payload.published_at) {
      postData.published_at = new Date().toISOString()
    } else if (payload.published_at) {
      postData.published_at = payload.published_at
    } else {
      postData.published_at = null
    }

    if (payload.status === 'agendado' && payload.scheduled_for) {
      postData.scheduled_for = payload.scheduled_for
    } else {
      postData.scheduled_for = null
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    await supabase.from('blog_post_tags').delete().eq('post_id', id)
    if (payload.tag_ids?.length) {
      const relations = payload.tag_ids.map((tagId) => ({ post_id: id, tag_id: tagId }))
      await supabase.from('blog_post_tags').insert(relations)
    }

    revalidatePath('/painel/blog')
    revalidatePath(`/painel/blog/${id}`)
    revalidatePath('/blog')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }

    const supabase = await createServerSupabase()
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    revalidatePath('/painel/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getPostsStats(): Promise<ActionResult<{
  total: number
  publicados: number
  rascunhos: number
  agendados: number
  arquivados: number
  viewsTotal: number
  thisMonth: number
}>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('status, views_count, created_at')

    if (error) return { success: false, error: error.message }
    const allPosts = data ?? []
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    return {
      success: true,
      data: {
        total: allPosts.length,
        publicados: allPosts.filter((item) => item.status === 'publicado').length,
        rascunhos: allPosts.filter((item) => item.status === 'rascunho').length,
        agendados: allPosts.filter((item) => item.status === 'agendado').length,
        arquivados: allPosts.filter((item) => item.status === 'arquivado').length,
        viewsTotal: allPosts.reduce((sum, item) => sum + Number(item.views_count ?? 0), 0),
        thisMonth: allPosts.filter((item) => item.created_at >= firstOfMonth).length,
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getCategories(): Promise<ActionResult<Array<BlogCategoryRow & { posts_count: number }>>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('blog_categories')
      .select(
        `
        *,
        posts:blog_posts(count)
      `
      )
      .order('order_index', { ascending: true })
      .order('name', { ascending: true })

    if (error) return { success: false, error: error.message }

    const categories = (data ?? []).map((category: any) => ({
      ...category,
      posts_count: category.posts?.[0]?.count ?? 0,
    }))

    return { success: true, data: categories }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getCategoryBySlug(slug: string): Promise<ActionResult<BlogCategoryRow>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) return { success: false, error: error?.message ?? 'Categoria nao encontrada' }
    return { success: true, data: data as BlogCategoryRow }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }
    const parsed = blogCategorySchema.safeParse(input)
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(' | ')
      return { success: false, error: message || 'Dados invalidos.' }
    }

    const supabase = await createServerSupabase()
    const payload = parsed.data
    const { data, error } = await supabase
      .from('blog_categories')
      .insert({
        name: payload.name,
        slug: payload.slug,
        description: payload.description || null,
        color: payload.color || '#10B981',
        meta_title: payload.meta_title || null,
        meta_description: payload.meta_description || null,
        cover_image_url: payload.cover_image_url || null,
      })
      .select('id')
      .single()

    if (error || !data) return { success: false, error: error?.message ?? 'Erro ao criar categoria' }

    revalidatePath('/painel/blog/categorias')
    revalidatePath('/painel/blog')
    revalidatePath('/blog')
    return { success: true, data: { id: data.id } }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }
    const parsed = blogCategorySchema.safeParse(input)
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(' | ')
      return { success: false, error: message || 'Dados invalidos.' }
    }

    const supabase = await createServerSupabase()
    const payload = parsed.data
    const { error } = await supabase
      .from('blog_categories')
      .update({
        name: payload.name,
        slug: payload.slug,
        description: payload.description || null,
        color: payload.color || '#10B981',
        meta_title: payload.meta_title || null,
        meta_description: payload.meta_description || null,
        cover_image_url: payload.cover_image_url || null,
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/painel/blog/categorias')
    revalidatePath('/painel/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }

    const supabase = await createServerSupabase()
    const { error } = await supabase.from('blog_categories').delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    revalidatePath('/painel/blog/categorias')
    revalidatePath('/painel/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getTags(): Promise<ActionResult<BlogTagRow[]>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name', { ascending: true })

    if (error) return { success: false, error: error.message }
    return { success: true, data: (data ?? []) as BlogTagRow[] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createTag(name: string, slug: string): Promise<ActionResult<BlogTagRow>> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }

    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('blog_tags')
      .insert({ name, slug })
      .select('id, name, slug')
      .single()

    if (error || !data) return { success: false, error: error?.message ?? 'Erro ao criar tag' }
    return { success: true, data: data as BlogTagRow }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  try {
    const profile = await getAdminProfile()
    if (!profile) return { success: false, error: 'Nao autorizado' }

    const supabase = await createServerSupabase()
    const { error } = await supabase.from('blog_tags').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getPublicPosts(params?: {
  categorySlug?: string
  page?: number
  perPage?: number
}): Promise<ActionResult<{ posts: ReturnType<typeof normalizePost>[]; total: number }>> {
  try {
    const supabase = await createServerSupabase()
    const page = params?.page ?? 1
    const perPage = params?.perPage ?? 12
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let categoryId: string | undefined
    if (params?.categorySlug) {
      const { data: category } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', params.categorySlug)
        .single()
      categoryId = category?.id
      if (!categoryId) return { success: true, data: { posts: [], total: 0 } }
    }

    let query = supabase
      .from('blog_posts')
      .select(
        `
        id, title, slug, excerpt, content, cover_image_url, cover_image_alt,
        status, published_at, views_count, meta_title, meta_description, og_title, og_description, og_image_url, focus_keyword, created_at, updated_at,
        category:blog_categories(id, name, slug, color, description, meta_title, meta_description, cover_image_url, order_index, created_at),
        author:profiles!author_id(id, name, avatar_url),
        tags:blog_post_tags(
          tag:blog_tags(id, name, slug)
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'publicado')
      .order('published_at', { ascending: false, nullsFirst: false })
      .range(from, to)

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error, count } = await query
    if (error) return { success: false, error: error.message }

    return {
      success: true,
      data: {
        posts: ((data ?? []) as PostRow[]).map(normalizePost),
        total: count ?? 0,
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getPublicPostBySlug(
  slug: string,
  options?: { incrementViews?: boolean }
): Promise<ActionResult<ReturnType<typeof normalizePost>>> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        category:blog_categories(id, name, slug, color, description, meta_title, meta_description, cover_image_url, order_index, created_at),
        author:profiles!author_id(id, name, avatar_url),
        tags:blog_post_tags(
          tag:blog_tags(id, name, slug)
        )
      `
      )
      .eq('slug', slug)
      .eq('status', 'publicado')
      .single()

    if (error || !data) return { success: false, error: error?.message ?? 'Artigo nao encontrado' }

    if (options?.incrementViews !== false) {
      const admin = createAdminClient()
      await admin
        .from('blog_posts')
        .update({ views_count: Number(data.views_count ?? 0) + 1 })
        .eq('id', data.id)
    }

    return { success: true, data: normalizePost(data as PostRow) }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
