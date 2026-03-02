import { notFound } from 'next/navigation'

import QuoteForm from '@/components/orcamentos/QuoteForm'
import {
  getClients,
  getPaymentConditions,
  getQuoteById,
  getQuoteHistory,
  getQuoteSettings,
} from '../_actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarOrcamentoPage({ params }: PageProps) {
  const { id } = await params

  const [quote, clients, paymentConditions, settings, history] = await Promise.all([
    getQuoteById(id).catch(() => null),
    getClients(),
    getPaymentConditions(),
    getQuoteSettings(),
    getQuoteHistory(id).catch(() => []),
  ])

  if (!quote) {
    notFound()
  }

  return (
    <QuoteForm
      mode="edit"
      initialQuote={quote}
      settings={settings}
      clients={clients}
      paymentConditions={paymentConditions}
      history={history}
    />
  )
}
