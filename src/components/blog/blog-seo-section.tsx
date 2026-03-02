'use client'

import { useMemo, useState } from 'react'

import BlogSeoChecklist from './blog-seo-checklist'

interface BlogSeoSectionProps {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl: string
  coverImageAlt: string
  metaTitle: string
  metaDescription: string
  focusKeyword: string
  onChange: (field: 'meta_title' | 'meta_description' | 'focus_keyword', value: string) => void
}

function counterState(length: number, idealMin: number, idealMax: number, warnMax: number) {
  if (length === 0) return 'neutral'
  if (length > warnMax) return 'danger'
  if (length < idealMin || length > idealMax) return 'warning'
  return 'good'
}

function progressClass(state: string) {
  if (state === 'good') return 'bg-emerald-500'
  if (state === 'warning') return 'bg-amber-500'
  if (state === 'danger') return 'bg-red-500'
  return 'bg-[#2a2a3a]'
}

export default function BlogSeoSection(props: BlogSeoSectionProps) {
  const [open, setOpen] = useState(true)
  const titleCount = props.metaTitle.length
  const descriptionCount = props.metaDescription.length

  const resolvedTitle = props.metaTitle.trim() || props.title
  const resolvedDescription = props.metaDescription.trim() || props.excerpt
  const previewUrl = `agemidea.com.br/blog/${props.slug || 'slug-do-artigo'}`

  const titleState = useMemo(() => counterState(titleCount, 30, 60, 70), [titleCount])
  const descriptionState = useMemo(
    () => counterState(descriptionCount, 120, 160, 170),
    [descriptionCount]
  )

  return (
    <section className="rounded-xl border border-[#1e1e2a] bg-[#111118]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h3 className="text-sm font-semibold text-[#e4e4e7]">SEO Avancado</h3>
        <span className="text-xs text-[#71717a]">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-[#1e1e2a] p-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#71717a]">Meta Title</label>
            <input
              value={props.metaTitle}
              onChange={(event) => props.onChange('meta_title', event.target.value)}
              maxLength={120}
              className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
            />
            <div className="flex items-center justify-between text-xs text-[#71717a]">
              <span>{titleCount}/60</span>
              <span className={titleState === 'danger' ? 'text-red-400' : ''}>
                ideal entre 30 e 60
              </span>
            </div>
            <div className="h-1 rounded bg-[#1e1e2a]">
              <div
                className={`h-full rounded ${progressClass(titleState)}`}
                style={{ width: `${Math.min((titleCount / 70) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#71717a]">Meta Description</label>
            <textarea
              value={props.metaDescription}
              onChange={(event) => props.onChange('meta_description', event.target.value)}
              maxLength={220}
              className="min-h-[90px] w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
            />
            <div className="flex items-center justify-between text-xs text-[#71717a]">
              <span>{descriptionCount}/160</span>
              <span className={descriptionState === 'danger' ? 'text-red-400' : ''}>
                ideal entre 120 e 160
              </span>
            </div>
            <div className="h-1 rounded bg-[#1e1e2a]">
              <div
                className={`h-full rounded ${progressClass(descriptionState)}`}
                style={{ width: `${Math.min((descriptionCount / 170) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#71717a]">Palavra-chave foco</label>
            <input
              value={props.focusKeyword}
              onChange={(event) => props.onChange('focus_keyword', event.target.value)}
              className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71717a]">
              Preview Google
            </p>
            <p className="truncate text-[15px] text-[#60a5fa]">{resolvedTitle || 'Titulo do artigo'}</p>
            <p className="truncate text-xs text-[#16a34a]">{previewUrl}</p>
            <p className="mt-1 line-clamp-2 text-xs text-[#a1a1aa]">
              {resolvedDescription || 'Descricao do artigo para mecanismos de busca.'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71717a]">
              Checklist SEO
            </p>
            <BlogSeoChecklist
              title={props.title}
              slug={props.slug}
              metaDescription={props.metaDescription}
              focusKeyword={props.focusKeyword}
              content={props.content}
              coverImageUrl={props.coverImageUrl}
              coverImageAlt={props.coverImageAlt}
            />
          </div>
        </div>
      )}
    </section>
  )
}
