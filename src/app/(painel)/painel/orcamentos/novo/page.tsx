import QuoteForm from '@/components/orcamentos/QuoteForm'
import {
  getClients,
  getPaymentConditions,
  getQuoteSettings,
} from '../_actions'

export default async function NovoOrcamentoPage() {
  const [clients, paymentConditions, settings] = await Promise.all([
    getClients(),
    getPaymentConditions(),
    getQuoteSettings(),
  ])

  return (
    <QuoteForm
      mode="create"
      settings={settings}
      clients={clients}
      paymentConditions={paymentConditions}
    />
  )
}
