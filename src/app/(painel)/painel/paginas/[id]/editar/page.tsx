import { notFound } from 'next/navigation'

import { PageEditor } from '@/components/editor/PageEditor'
import { getPageById } from '@/lib/actions/pages'

interface EditarPaginaPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarPaginaPage({ params }: EditarPaginaPageProps) {
  const { id } = await params

  try {
    const page = await getPageById(id)
    if (!page) notFound()

    return <PageEditor mode="edit" pageId={id} initialData={page} />
  } catch {
    notFound()
  }
}
