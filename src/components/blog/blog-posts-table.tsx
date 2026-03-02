'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { deletePost } from '@/actions/blog'
import Pagination from '@/components/ui/Pagination'
import { formatDate } from '@/lib/utils'

interface BlogPostTableRow {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
  status: 'rascunho' | 'publicado' | 'agendado' | 'arquivado'
  views_count: number
  created_at: string
}

interface BlogPostsTableProps {
  posts: BlogPostTableRow[]
  stats: {
    total: number
    publicados: number
    rascunhos: number
    agendados: number
    arquivados: number
  }
}

const ITEMS_PER_PAGE = 20

const statusConfig: Record<BlogPostTableRow['status'], { label: string; className: string }> = {
  publicado: {
    label: 'Publicado',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  rascunho: {
    label: 'Rascunho',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  agendado: {
    label: 'Agendado',
    className: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  },
  arquivado: {
    label: 'Arquivado',
    className: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
  },
}

export default function BlogPostsTable({ posts, stats }: BlogPostsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'todos' | BlogPostTableRow['status']>('todos')
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return posts.filter((post) => {
      const statusMatch = status === 'todos' || post.status === status
      const searchMatch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q)
      return statusMatch && searchMatch
    })
  }, [posts, search, status])

  const paginated = useMemo(() => {
    const from = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(from, from + ITEMS_PER_PAGE)
  }, [filtered, page])

  const removePost = (id: string) => {
    const confirmed = window.confirm('Deseja excluir este artigo?')
    if (!confirmed) return
    startTransition(async () => {
      const result = await deletePost(id)
      if (!result.success) {
        toast.error(result.error || 'Erro ao excluir artigo.')
        return
      }
      toast.success('Artigo excluido.')
      router.refresh()
    })
  }

  const statusItems = [
    { id: 'todos' as const, label: `Todos (${stats.total})` },
    { id: 'publicado' as const, label: `Publicados (${stats.publicados})` },
    { id: 'rascunho' as const, label: `Rascunhos (${stats.rascunhos})` },
    { id: 'agendado' as const, label: `Agendados (${stats.agendados})` },
    { id: 'arquivado' as const, label: `Arquivados (${stats.arquivados})` },
  ]

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {statusItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setStatus(item.id)
                setPage(1)
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                status === item.id
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                  : 'border-[#1e1e2a] text-[#71717a] hover:text-[#e4e4e7]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Buscar artigos..."
          className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#111118] md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2a] bg-[#0a0a0f]">
              {['Artigo', 'Categoria', 'Status', 'Views', 'Data', 'Acoes'].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#71717a]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((post) => (
              <tr key={post.id} className="border-b border-[#1e1e2a] last:border-0 hover:bg-[#151520]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 overflow-hidden rounded-md border border-[#1e1e2a] bg-[#0a0a0f]">
                      {post.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#e4e4e7]">{post.title}</p>
                      <p className="text-xs text-[#71717a]">/{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {post.category ? (
                    <span className="rounded-full border border-[#1e1e2a] px-2 py-0.5 text-xs text-[#a1a1aa]">
                      {post.category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-[#52525b]">Sem categoria</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig[post.status].className}`}
                  >
                    {statusConfig[post.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#a1a1aa]">{post.views_count}</td>
                <td className="px-4 py-3 text-sm text-[#a1a1aa]">{formatDate(post.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/painel/blog/${post.id}`}
                      className="rounded-md border border-[#1e1e2a] px-2 py-1 text-xs text-[#a1a1aa] hover:text-white"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => removePost(post.id)}
                      disabled={isPending}
                      className="rounded-md border border-red-500/20 px-2 py-1 text-xs text-red-400 disabled:opacity-60"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#71717a]">
                  Nenhum artigo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {paginated.map((post) => (
          <article key={post.id} className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#e4e4e7]">{post.title}</p>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusConfig[post.status].className}`}
              >
                {statusConfig[post.status].label}
              </span>
            </div>
            <p className="text-xs text-[#71717a] mb-2">/{post.slug}</p>
            <div className="mb-3 flex items-center justify-between text-xs text-[#a1a1aa]">
              <span>{post.category?.name || 'Sem categoria'}</span>
              <span>{post.views_count} views</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/painel/blog/${post.id}`}
                className="flex-1 rounded-md border border-[#1e1e2a] px-2 py-1.5 text-center text-xs text-[#a1a1aa]"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => removePost(post.id)}
                disabled={isPending}
                className="flex-1 rounded-md border border-red-500/20 px-2 py-1.5 text-xs text-red-400 disabled:opacity-60"
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Pagination
          currentPage={page}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
