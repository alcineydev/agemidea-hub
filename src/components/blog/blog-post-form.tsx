'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  createCategory,
  createPost,
  updatePost,
} from '@/actions/blog'
import { useMediaPicker } from '@/components/media'
import { slugify } from '@/lib/utils'
import BlogContentEditor from './blog-content-editor'
import BlogOgSection from './blog-og-section'
import BlogSeoSection from './blog-seo-section'
import BlogTagInput from './blog-tag-input'

type PostStatus = 'rascunho' | 'publicado' | 'agendado' | 'arquivado'

interface CategoryOption {
  id: string
  name: string
  slug: string
  color: string | null
}

interface TagOption {
  id: string
  name: string
  slug: string
}

interface AuthorInfo {
  id: string
  name: string
}

interface BlogPostFormData {
  id?: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  cover_image_alt: string | null
  category_id: string | null
  status: PostStatus
  meta_title: string | null
  meta_description: string | null
  focus_keyword: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  published_at: string | null
  scheduled_for: string | null
  tags: TagOption[]
  author?: AuthorInfo | null
}

interface BlogPostFormProps {
  post?: BlogPostFormData | null
  categories: CategoryOption[]
  tags: TagOption[]
}

const statusOptions: Array<{ value: PostStatus; label: string }> = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'arquivado', label: 'Arquivado' },
]

function toDatetimeLocal(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function toIso(value: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

const inputClass =
  'w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50'

export default function BlogPostForm({ post, categories: initialCategories, tags: initialTags }: BlogPostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { openPicker, PickerModal } = useMediaPicker({
    title: 'Selecionar imagem do blog',
    accept: ['image/*'],
    maxSize: 5 * 1024 * 1024,
  })

  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories)
  const [tags, setTags] = useState<TagOption[]>(initialTags)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(post?.tags?.map((tag) => tag.id) ?? [])
  const [slugLocked, setSlugLocked] = useState(Boolean(post?.id))
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [savingMode, setSavingMode] = useState<PostStatus | null>(null)

  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    cover_image_url: post?.cover_image_url ?? '',
    cover_image_alt: post?.cover_image_alt ?? '',
    category_id: post?.category_id ?? '',
    status: post?.status ?? ('rascunho' as PostStatus),
    meta_title: post?.meta_title ?? '',
    meta_description: post?.meta_description ?? '',
    focus_keyword: post?.focus_keyword ?? '',
    og_title: post?.og_title ?? '',
    og_description: post?.og_description ?? '',
    og_image_url: post?.og_image_url ?? '',
    published_at: toDatetimeLocal(post?.published_at),
    scheduled_for: toDatetimeLocal(post?.scheduled_for),
  })

  const pageTitle = post?.id ? 'Editar Artigo' : 'Novo Artigo'

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === form.category_id) ?? null,
    [categories, form.category_id]
  )

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleTitleChange = (value: string) => {
    setForm((prev) => {
      const nextSlug = slugLocked ? prev.slug : slugify(value)
      return {
        ...prev,
        title: value,
        slug: nextSlug,
      }
    })
  }

  const pickCoverImage = async () => {
    const selected = await openPicker()
    if (!selected) return

    setForm((prev) => ({
      ...prev,
      cover_image_url: selected.mediaUrl || selected.url,
      cover_image_alt: prev.cover_image_alt || selected.alt_text || selected.title || '',
    }))
  }

  const pickOgImage = async () => {
    const selected = await openPicker()
    if (!selected) return

    setForm((prev) => ({
      ...prev,
      og_image_url: selected.mediaUrl || selected.url,
    }))
  }

  const createInlineCategory = () => {
    const name = newCategoryName.trim()
    const slug = slugify(name)
    if (!name || !slug) {
      toast.error('Informe um nome valido para categoria.')
      return
    }

    startTransition(async () => {
      const result = await createCategory({ name, slug, color: '#0ea5e9' })
      if (!result.success || !result.data) {
        toast.error(result.error || 'Nao foi possivel criar categoria.')
        return
      }

      const created: CategoryOption = {
        id: result.data.id,
        name,
        slug,
        color: '#0ea5e9',
      }
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setField('category_id', created.id)
      setNewCategoryName('')
      setShowNewCategory(false)
      router.refresh()
      toast.success('Categoria criada.')
    })
  }

  const submit = (targetStatus: PostStatus) => {
    const title = form.title.trim()
    const slug = form.slug.trim()
    const content = form.content.trim()

    if (title.length < 3) {
      toast.error('Titulo deve ter no minimo 3 caracteres.')
      return
    }

    if (!slug) {
      toast.error('Slug obrigatorio.')
      return
    }

    if (!content) {
      toast.error('Conteudo obrigatorio.')
      return
    }

    if (targetStatus === 'agendado' && !form.scheduled_for) {
      toast.error('Defina data/hora para agendamento.')
      return
    }

    setSavingMode(targetStatus)
    startTransition(async () => {
      const payload = {
        title,
        slug,
        excerpt: form.excerpt.trim() || undefined,
        content: form.content,
        cover_image_url: form.cover_image_url.trim() || undefined,
        cover_image_alt: form.cover_image_alt.trim() || undefined,
        category_id: form.category_id || undefined,
        status: targetStatus,
        meta_title: form.meta_title.trim() || undefined,
        meta_description: form.meta_description.trim() || undefined,
        focus_keyword: form.focus_keyword.trim() || undefined,
        og_title: form.og_title.trim() || undefined,
        og_description: form.og_description.trim() || undefined,
        og_image_url: form.og_image_url.trim() || undefined,
        published_at: toIso(form.published_at),
        scheduled_for: toIso(form.scheduled_for),
        tag_ids: selectedTagIds,
      }

      const result = post?.id ? await updatePost(post.id, payload) : await createPost(payload)

      if (!result.success) {
        toast.error(result.error || 'Erro ao salvar artigo.')
        setSavingMode(null)
        return
      }

      toast.success(
        targetStatus === 'publicado'
          ? 'Artigo publicado.'
          : targetStatus === 'agendado'
            ? 'Artigo agendado.'
            : 'Rascunho salvo.'
      )
      router.push('/painel/blog')
      router.refresh()
    })
  }

  const publishDatetimeLabel = form.status === 'agendado' ? 'Agendamento' : 'Data de publicacao'

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex flex-col gap-3 rounded-xl border border-[#1e1e2a] bg-[#111118] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/painel/blog" className="text-xs font-semibold text-[#71717a] hover:text-white">
            Voltar para artigos
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-[#e4e4e7]">{pageTitle}</h1>
          <p className="text-sm text-[#71717a]">Gerencie conteudo, SEO e distribuicao.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => submit('rascunho')}
            disabled={isPending}
            className="rounded-lg border border-[#1e1e2a] px-3 py-2 text-sm font-semibold text-[#a1a1aa] hover:text-white disabled:opacity-60"
          >
            {isPending && savingMode === 'rascunho' ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <button
            type="button"
            onClick={() => submit('agendado')}
            disabled={isPending}
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-300 disabled:opacity-60"
          >
            {isPending && savingMode === 'agendado' ? 'Agendando...' : 'Agendar'}
          </button>
          <button
            type="button"
            onClick={() => submit('publicado')}
            disabled={isPending}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending && savingMode === 'publicado' ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[#e4e4e7]">Titulo e slug</h2>
            <div className="space-y-3">
              <input
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Titulo do artigo"
                className={inputClass}
              />

              <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#71717a]">Slug</span>
                  <button
                    type="button"
                    onClick={() => setSlugLocked((prev) => !prev)}
                    className="text-xs font-semibold text-cyan-400"
                  >
                    {slugLocked ? 'Editar slug' : 'Bloquear slug'}
                  </button>
                </div>
                <input
                  value={form.slug}
                  onChange={(event) => setField('slug', slugify(event.target.value))}
                  disabled={slugLocked}
                  className={`${inputClass} ${slugLocked ? 'opacity-70' : ''}`}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2 rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <h2 className="text-sm font-semibold text-[#e4e4e7]">Conteudo</h2>
            <BlogContentEditor value={form.content} onChange={(value) => setField('content', value)} />
          </section>

          <BlogSeoSection
            title={form.title}
            slug={form.slug}
            excerpt={form.excerpt}
            content={form.content}
            coverImageUrl={form.cover_image_url}
            coverImageAlt={form.cover_image_alt}
            metaTitle={form.meta_title}
            metaDescription={form.meta_description}
            focusKeyword={form.focus_keyword}
            onChange={(field, value) => setField(field, value)}
          />

          <BlogOgSection
            ogTitle={form.og_title}
            ogDescription={form.og_description}
            ogImageUrl={form.og_image_url}
            onChange={(field, value) => setField(field, value)}
          />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#e4e4e7]">Publicacao</h3>
            <div className="space-y-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-[#71717a]">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setField('status', event.target.value as PostStatus)}
                  className={inputClass}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold text-[#71717a]">{publishDatetimeLabel}</span>
                <input
                  type="datetime-local"
                  value={form.status === 'agendado' ? form.scheduled_for : form.published_at}
                  onChange={(event) =>
                    form.status === 'agendado'
                      ? setField('scheduled_for', event.target.value)
                      : setField('published_at', event.target.value)
                  }
                  className={inputClass}
                />
              </label>

              <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3">
                <span className="text-xs font-semibold text-[#71717a]">Autor</span>
                <p className="mt-1 text-sm text-[#e4e4e7]">{post?.author?.name || 'Administrador'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#e4e4e7]">Imagem de capa</h3>
            <button
              type="button"
              onClick={pickCoverImage}
              className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-[#1e1e2a] bg-[#0a0a0f] text-xs font-semibold text-[#71717a] hover:text-white"
            >
              {form.cover_image_url ? 'Trocar imagem' : 'Selecionar imagem'}
            </button>
            {form.cover_image_url ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-[#1e1e2a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.cover_image_url} alt={form.cover_image_alt || form.title} className="h-40 w-full object-cover" />
              </div>
            ) : null}
            <input
              value={form.cover_image_alt}
              onChange={(event) => setField('cover_image_alt', event.target.value)}
              placeholder="Alt text da imagem"
              className={`${inputClass} mt-3`}
            />
            <p className="mt-2 text-[11px] text-[#52525b]">PNG/JPG/WebP, max 5MB. Recomendado 1200x630.</p>
          </section>

          <section className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#e4e4e7]">Categoria</h3>
              <button
                type="button"
                onClick={() => setShowNewCategory((prev) => !prev)}
                className="text-xs font-semibold text-cyan-400"
              >
                {showNewCategory ? 'Fechar' : 'Criar nova'}
              </button>
            </div>

            <select
              value={form.category_id}
              onChange={(event) => setField('category_id', event.target.value)}
              className={inputClass}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {selectedCategory ? (
              <p className="mt-2 text-xs text-[#71717a]">Slug: /categoria/{selectedCategory.slug}</p>
            ) : null}

            {showNewCategory ? (
              <div className="mt-3 space-y-2 rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3">
                <input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Nome da categoria"
                  className={inputClass}
                />
                <p className="text-xs text-[#71717a]">Slug: {slugify(newCategoryName) || '-'}</p>
                <button
                  type="button"
                  onClick={createInlineCategory}
                  disabled={isPending}
                  className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 disabled:opacity-60"
                >
                  Criar categoria
                </button>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#e4e4e7]">Tags</h3>
            <BlogTagInput
              availableTags={tags}
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
              onTagsUpdate={setTags}
            />
          </section>

          <section className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#e4e4e7]">Resumo</h3>
            <textarea
              value={form.excerpt}
              onChange={(event) => setField('excerpt', event.target.value)}
              className="min-h-24 w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
              placeholder="Resumo para listagem e SEO"
            />
          </section>

          <section className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#e4e4e7]">Imagem Open Graph</h3>
            <button
              type="button"
              onClick={pickOgImage}
              className="w-full rounded-lg border border-[#1e1e2a] px-3 py-2 text-sm text-[#a1a1aa] hover:text-white"
            >
              Selecionar OG image
            </button>
            <input
              value={form.og_image_url}
              onChange={(event) => setField('og_image_url', event.target.value)}
              placeholder="https://..."
              className={`${inputClass} mt-3`}
            />
          </section>
        </aside>
      </div>

      {PickerModal}
    </div>
  )
}
