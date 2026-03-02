import { notFound } from 'next/navigation'

import ClienteEditor from '../_components/ClienteEditor'
import { getAdminClientById } from '../_actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: PageProps) {
  const { id } = await params
  const client = await getAdminClientById(id)

  if (!client) notFound()

  return <ClienteEditor mode="edit" initialClient={client} />
}
