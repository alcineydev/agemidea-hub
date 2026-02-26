import { notFound } from 'next/navigation'

import { ModelEditor } from '@/components/editor/ModelEditor'
import { getModelById } from '@/lib/actions/models'
import { getPages } from '@/lib/actions/pages'

interface EditarModeloPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarModeloPage({ params }: EditarModeloPageProps) {
  const { id } = await params

  try {
    const [model, pages] = await Promise.all([getModelById(id), getPages({ type: 'todas' })])
    if (!model) notFound()

    const options = pages.map((page) => ({
      id: page.id as string,
      title: page.title as string,
      slug: (page.slug as string) || '',
    }))

    return <ModelEditor mode="edit" modelId={id} initialData={model} pages={options} />
  } catch {
    notFound()
  }
}
