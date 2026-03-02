import { getCategories } from '@/actions/blog'
import BlogCategoriesManager from '@/components/blog/blog-categories-manager'

export default async function CategoriasPage() {
  const categoriesResult = await getCategories()
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : []

  return <BlogCategoriesManager categories={categories} />
}
