import { getCategories, getTags } from '@/actions/blog'
import BlogPostForm from '@/components/blog/blog-post-form'

export default async function NovoArtigoPage() {
  const [categoriesResult, tagsResult] = await Promise.all([getCategories(), getTags()])

  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : []
  const tags = tagsResult.success && tagsResult.data ? tagsResult.data : []

  return <BlogPostForm categories={categories} tags={tags} />
}
