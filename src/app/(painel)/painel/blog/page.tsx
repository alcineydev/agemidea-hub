import Link from 'next/link'

import { getPosts, getPostsStats } from '@/actions/blog'
import BlogPostsTable from '@/components/blog/blog-posts-table'
import BlogStatsCards from '@/components/blog/blog-stats-cards'

export default async function BlogPage() {
  const [statsResult, postsResult] = await Promise.all([
    getPostsStats(),
    getPosts({ page: 1, perPage: 200 }),
  ])

  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : {
        total: 0,
        publicados: 0,
        rascunhos: 0,
        agendados: 0,
        arquivados: 0,
        viewsTotal: 0,
        thisMonth: 0,
      }

  const posts = postsResult.success && postsResult.data ? postsResult.data.posts : []

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e4e4e7]">Artigos do Blog</h1>
          <p className="text-sm text-[#71717a]">Gerencie conteudo, SEO e distribuicao dos artigos.</p>
        </div>
        <Link
          href="/painel/blog/novo"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Novo Artigo
        </Link>
      </header>

      <BlogStatsCards stats={stats} />

      <BlogPostsTable
        posts={posts}
        stats={{
          total: stats.total,
          publicados: stats.publicados,
          rascunhos: stats.rascunhos,
          agendados: stats.agendados,
          arquivados: stats.arquivados,
        }}
      />
    </div>
  )
}
