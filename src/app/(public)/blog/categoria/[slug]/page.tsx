import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getCategoryBySlug, getPublicPosts } from '@/actions/blog'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoryResult = await getCategoryBySlug(slug)

  if (!categoryResult.success || !categoryResult.data) {
    return {
      title: 'Categoria - Blog',
      description: 'Categorias do blog Agemidea.',
    }
  }

  const category = categoryResult.data
  return {
    title: category.meta_title || `${category.name} - Blog`,
    description: category.meta_description || category.description || undefined,
    openGraph: {
      title: category.meta_title || `${category.name} - Blog`,
      description: category.meta_description || category.description || undefined,
      images: category.cover_image_url ? [{ url: category.cover_image_url }] : [],
      type: 'website',
    },
  }
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params

  const [categoryResult, postsResult] = await Promise.all([
    getCategoryBySlug(slug),
    getPublicPosts({ categorySlug: slug, page: 1, perPage: 120 }),
  ])

  if (!categoryResult.success || !categoryResult.data) {
    notFound()
  }

  const category = categoryResult.data
  const posts = postsResult.success && postsResult.data ? postsResult.data.posts : []

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-xl border border-[#1e1e2a] bg-[#111118] p-6">
          <Link href="/blog" className="text-xs font-semibold text-cyan-400">
            Voltar para blog
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color || '#0ea5e9' }} />
            <h1 className="text-3xl font-bold">{category.name}</h1>
          </div>
          {category.description ? (
            <p className="mt-2 text-sm text-[#71717a]">{category.description}</p>
          ) : null}
        </header>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-8 text-center text-sm text-[#71717a]">
            Nenhum artigo publicado nesta categoria.
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#111118] hover:border-[#2a2a3a]">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="h-48 w-full bg-[#0a0a0f]">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.cover_image_alt || post.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </Link>
                <div className="space-y-2 p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold">{post.title}</h2>
                  <p className="line-clamp-3 text-sm text-[#71717a]">{post.excerpt || 'Sem resumo disponivel.'}</p>
                  <div className="flex items-center justify-between text-xs text-[#52525b]">
                    <span>{post.published_at ? formatDate(post.published_at) : '-'}</span>
                    <span>{post.author?.name || 'Agemidea'}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
