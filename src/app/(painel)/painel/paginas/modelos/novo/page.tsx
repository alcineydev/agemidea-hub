import { ModelEditor } from '@/components/editor/ModelEditor'
import { getPages } from '@/lib/actions/pages'

export default async function NovoModeloPage() {
  const pages = await getPages({ type: 'todas' })
  const options = pages.map((page) => ({
    id: page.id as string,
    title: page.title as string,
    slug: (page.slug as string) || '',
  }))

  return <ModelEditor mode="create" pages={options} />
}
