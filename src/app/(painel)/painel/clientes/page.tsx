import ClientesListClient from './_components/ClientesListClient'
import { listAdminClients } from './_actions'

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const clients = await listAdminClients(params.search).catch(() => [])
  return <ClientesListClient clients={clients} />
}
