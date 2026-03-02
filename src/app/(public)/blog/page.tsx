import type { Metadata } from 'next'
import Link from 'next/link'

import { getCategories, getPublicPosts } from '@/actions/blog'
import { formatDate } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog - Agemidea',
    description: 'Artigos sobre marketing digital, SEO, desenvolvimento web e tecnologia.',
    openGraph: {
      title: 'Blog - Agemidea',
      description: 'Artigos sobre marketing digital, SEO, desenvolvimento web e tecnologia.',
      type: 'website',
    },
  }
}

export default async function PublicBlogPage() {
  const [postsResult, categoriesResult] = await Promise.all([getPublicPosts(), getCategories()])

  const posts = postsResult.success && postsResult.data ? postsResult.data.posts : []
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : []

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-xl border border-[#1e1e2a] bg-[#111118] p-6">
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="mt-2 text-sm text-[#71717a]">
            Conteudos sobre marketing digital, tecnologia e crescimento.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400"
            >
              Todas
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/categoria/${category.slug}`}
                className="rounded-full border border-[#1e1e2a] px-3 py-1 text-xs font-semibold text-[#71717a] hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-8 text-center text-sm text-[#71717a]">
            Nenhum artigo publicado ate o momento.
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

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full border border-[#1e1e2a] px-2 py-0.5 text-[#a1a1aa]">
                      {post.category?.name || 'Sem categoria'}
                    </span>
                    <span className="text-[#52525b]">{post.published_at ? formatDate(post.published_at) : '-'}</span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="block">
                    <h2 className="line-clamp-2 text-lg font-semibold text-[#e4e4e7]">{post.title}</h2>
                  </Link>

                  <p className="line-clamp-3 text-sm text-[#71717a]">
                    {post.excerpt || 'Sem resumo disponivel.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#52525b]">
                    <span>{post.author?.name || 'Agemidea'}</span>
                    <span>{post.views_count} views</span>
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
