import { notFound } from 'next/navigation'

import { getPublicQuoteView } from '@/app/(painel)/painel/orcamentos/_actions'
import PublicQuoteClient from './PublicQuoteClient'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function PublicQuotePage({ params }: PageProps) {
  const { token } = await params
  const data = await getPublicQuoteView(token)

  if (!data) notFound()

  return <PublicQuoteClient token={token} quote={data.quote} settings={data.settings} />
}
