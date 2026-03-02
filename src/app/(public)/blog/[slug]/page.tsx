import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPublicPostBySlug } from '@/actions/blog'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getPublicPostBySlug(slug, { incrementViews: false })

  if (!result.success || !result.data) {
    return { title: 'Artigo nao encontrado' }
  }

  const post = result.data
  const image = post.og_image_url || post.cover_image_url || undefined

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt || undefined,
      images: image ? [{ url: image }] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt || undefined,
      images: image ? [image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const result = await getPublicPostBySlug(slug)

  if (!result.success || !result.data) {
    notFound()
  }

  const post = result.data

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: post.cover_image_url || undefined,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Agemidea',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Agemidea',
    },
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || undefined,
  }

  return (
    <article className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/blog" className="mb-4 inline-flex text-sm font-semibold text-cyan-400">
          Voltar ao blog
        </Link>

        <header className="mb-6 space-y-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#71717a]">
            <span>{post.author?.name || 'Agemidea'}</span>
            <span>|</span>
            <span>{post.published_at ? formatDate(post.published_at) : '-'}</span>
            <span>|</span>
            <span>{post.views_count} views</span>
            {post.category ? (
              <>
                <span>|</span>
                <Link href={`/blog/categoria/${post.category.slug}`} className="text-cyan-400">
                  {post.category.name}
                </Link>
              </>
            ) : null}
          </div>
          {post.excerpt ? (
            <p className="text-base text-[#a1a1aa]">{post.excerpt}</p>
          ) : null}
        </header>

        {post.cover_image_url ? (
          <div className="mb-6 overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#111118]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt={post.cover_image_alt || post.title}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <div className="rounded-xl border border-[#1e1e2a] bg-[#111118] p-6">
          <div
            className="prose prose-invert max-w-none prose-headings:text-[#e4e4e7] prose-p:text-[#c4c4cb] prose-strong:text-white prose-a:text-cyan-400"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>

        {post.tags?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  )
}
