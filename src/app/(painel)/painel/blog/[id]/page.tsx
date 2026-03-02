import { notFound } from 'next/navigation'

import { getCategories, getPostById, getTags } from '@/actions/blog'
import BlogPostForm from '@/components/blog/blog-post-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarArtigoPage({ params }: PageProps) {
  const { id } = await params

  const [postResult, categoriesResult, tagsResult] = await Promise.all([
    getPostById(id),
    getCategories(),
    getTags(),
  ])

  if (!postResult.success || !postResult.data) {
    notFound()
  }

  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : []
  const tags = tagsResult.success && tagsResult.data ? tagsResult.data : []

  return <BlogPostForm post={postResult.data} categories={categories} tags={tags} />
}
