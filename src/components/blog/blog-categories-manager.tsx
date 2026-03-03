'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/actions/blog'
import { slugify } from '@/lib/utils'
import { useMediaPicker } from '@/components/media'

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  meta_title: string | null
  meta_description: string | null
  cover_image_url: string | null
  posts_count?: number
}

interface BlogCategoriesManagerProps {
  categories: CategoryItem[]
}

const palette = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#f97316', '#ec4899']

const inputClass =
  'w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50'

function normalizeImageUrl(value?: string) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('/')) {
    if (typeof window !== 'undefined') return `${window.location.origin}${trimmed}`
    return trimmed
  }
  return trimmed
}

const emptyForm = {
  id: '',
  name: '',
  slug: '',
  description: '',
  color: '#0ea5e9',
  meta_title: '',
  meta_description: '',
  cover_image_url: '',
}

export default function BlogCategoriesManager({ categories: initialCategories }: BlogCategoriesManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { openPicker, PickerModal } = useMediaPicker({
    title: 'Selecionar imagem da categoria',
    accept: ['image/*'],
    maxSize: 5 * 1024 * 1024,
  })

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)
  const [formOpen, setFormOpen] = useState(false)
  const [slugLocked, setSlugLocked] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  )

  const isEditing = Boolean(form.id)

  const openNew = () => {
    setForm(emptyForm)
    setFormOpen(true)
    setSlugLocked(false)
  }

  const openEdit = (category: CategoryItem) => {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      color: category.color ?? '#0ea5e9',
      meta_title: category.meta_title ?? '',
      meta_description: category.meta_description ?? '',
      cover_image_url: category.cover_image_url ?? '',
    })
    setFormOpen(true)
    setSlugLocked(true)
  }

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugLocked ? prev.slug : slugify(value),
    }))
  }

  const closeForm = () => {
    setFormOpen(false)
    setForm(emptyForm)
  }

  const save = () => {
    const name = form.name.trim()
    const slug = form.slug.trim()
    if (name.length < 2) {
      toast.error('Nome deve ter no minimo 2 caracteres.')
      return
    }
    if (!slug) {
      toast.error('Slug obrigatorio.')
      return
    }

    startTransition(async () => {
      const payload = {
        name,
        slug,
        description: form.description.trim() || undefined,
        color: form.color || '#0ea5e9',
        meta_title: form.meta_title.trim() || undefined,
        meta_description: form.meta_description.trim() || undefined,
        cover_image_url: normalizeImageUrl(form.cover_image_url),
      }

      if (isEditing) {
        const result = await updateCategory(form.id, payload)
        if (!result.success) {
          toast.error(result.error || 'Erro ao salvar categoria.')
          return
        }

        setCategories((prev) =>
          prev.map((item) =>
            item.id === form.id
              ? {
                  ...item,
                  ...payload,
                  description: payload.description ?? null,
                  meta_title: payload.meta_title ?? null,
                  meta_description: payload.meta_description ?? null,
                  cover_image_url: payload.cover_image_url ?? null,
                }
              : item
          )
        )
      } else {
        const result = await createCategory(payload)
        const createdId = result.data?.id
        if (!result.success || !createdId) {
          toast.error(result.error || 'Erro ao salvar categoria.')
          return
        }

        setCategories((prev) => [
          ...prev,
          {
            id: createdId,
            name: payload.name,
            slug: payload.slug,
            description: payload.description ?? null,
            color: payload.color ?? '#0ea5e9',
            meta_title: payload.meta_title ?? null,
            meta_description: payload.meta_description ?? null,
            cover_image_url: payload.cover_image_url ?? null,
            posts_count: 0,
          },
        ])
      }

      toast.success(isEditing ? 'Categoria atualizada.' : 'Categoria criada.')
      closeForm()
      router.refresh()
    })
  }

  const remove = (category: CategoryItem) => {
    const warn = category.posts_count
      ? `A categoria possui ${category.posts_count} post(s). Os posts ficarao sem categoria.`
      : 'Deseja excluir esta categoria?'
    if (!window.confirm(warn)) return

    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (!result.success) {
        toast.error(result.error || 'Erro ao excluir categoria.')
        return
      }
      setCategories((prev) => prev.filter((item) => item.id !== category.id))
      toast.success('Categoria excluida.')
      if (form.id === category.id) closeForm()
      router.refresh()
    })
  }

  const selectCoverImage = async () => {
    const selected = await openPicker()
    if (!selected) return
    setField('cover_image_url', selected.url || selected.mediaUrl)
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 rounded-xl border border-[#1e1e2a] bg-[#111118] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e4e4e7]">Categorias do Blog</h1>
          <p className="text-sm text-[#71717a]">Taxonomia, SEO e imagem de capa por categoria.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Nova Categoria
        </button>
      </header>

      <div className={`grid gap-4 ${formOpen ? 'grid-cols-1 xl:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
        <section className="space-y-3">
          {sortedCategories.length === 0 ? (
            <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-6 text-center text-sm text-[#71717a]">
              Nenhuma categoria cadastrada.
            </div>
          ) : (
            sortedCategories.map((category) => (
              <article key={category.id} className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-4 hover:border-[#2a2a3a]">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color ?? '#0ea5e9' }} />
                      <h2 className="text-base font-semibold text-[#e4e4e7]">{category.name}</h2>
                      {category.meta_title ? (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          SEO OK
                        </span>
                      ) : null}
                    </div>
                    <p className="font-mono text-xs text-[#52525b]">/{category.slug}</p>
                    {category.description ? (
                      <p className="mt-2 text-sm text-[#a1a1aa]">{category.description}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#71717a]">{category.posts_count ?? 0} posts</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="rounded-lg border border-[#1e1e2a] px-3 py-1.5 text-xs font-semibold text-[#a1a1aa] hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(category)}
                    disabled={isPending}
                    className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 disabled:opacity-60"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        {formOpen ? (
          <aside className="h-fit space-y-3 rounded-xl border border-[#1e1e2a] bg-[#111118] p-4 xl:sticky xl:top-6">
            <h2 className="text-sm font-semibold text-[#e4e4e7]">{isEditing ? 'Editar categoria' : 'Nova categoria'}</h2>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-[#71717a]">Nome</span>
              <input
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#71717a]">Slug</span>
                <button
                  type="button"
                  onClick={() => setSlugLocked((prev) => !prev)}
                  className="text-xs font-semibold text-cyan-400"
                >
                  {slugLocked ? 'Editar' : 'Bloquear'}
                </button>
              </div>
              <input
                value={form.slug}
                onChange={(event) => setField('slug', slugify(event.target.value))}
                disabled={slugLocked}
                className={`${inputClass} ${slugLocked ? 'opacity-70' : ''}`}
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-[#71717a]">Descricao</span>
              <textarea
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
                className="min-h-24 w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
              />
            </label>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#71717a]">Cor</span>
              <div className="flex flex-wrap gap-2">
                {palette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setField('color', color)}
                    className={`h-8 w-8 rounded-full border ${form.color === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Selecionar cor ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3">
              <span className="text-xs font-semibold text-[#71717a]">SEO da categoria</span>
              <input
                value={form.meta_title}
                onChange={(event) => setField('meta_title', event.target.value)}
                placeholder="Meta title"
                className={inputClass}
              />
              <textarea
                value={form.meta_description}
                onChange={(event) => setField('meta_description', event.target.value)}
                placeholder="Meta description"
                className="min-h-20 w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
              />
              <button
                type="button"
                onClick={selectCoverImage}
                className="w-full rounded-lg border border-[#1e1e2a] px-3 py-2 text-sm text-[#a1a1aa] hover:text-white"
              >
                Selecionar imagem de capa
              </button>
              {form.cover_image_url ? (
                <div className="overflow-hidden rounded-lg border border-[#1e1e2a]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.cover_image_url} alt={form.name || 'Categoria'} className="h-36 w-full object-cover" />
                </div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 rounded-lg border border-[#1e1e2a] px-3 py-2 text-sm font-semibold text-[#71717a] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      {PickerModal}
    </div>
  )
}
