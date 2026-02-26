import { redirect } from 'next/navigation'

interface LegacyPageProps {
  params: Promise<{ id: string }>
}

export default async function LegacyEditarPaginaPage({ params }: LegacyPageProps) {
  const { id } = await params
  redirect(`/painel/paginas/${id}/editar`)
}
