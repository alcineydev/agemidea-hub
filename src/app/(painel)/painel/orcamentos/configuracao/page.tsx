import OrcamentosConfigClient from './OrcamentosConfigClient'
import { getSettings } from '@/app/(painel)/painel/configuracoes/actions'
import {
  getPaymentConditions,
  getQuoteSettings,
} from '../_actions'

export default async function OrcamentosConfiguracaoPage() {
  const [quoteSettings, paymentConditions, siteSettings] = await Promise.all([
    getQuoteSettings(),
    getPaymentConditions(),
    getSettings().catch(() => ({})),
  ])

  return (
    <OrcamentosConfigClient
      initialSettings={quoteSettings}
      paymentConditions={paymentConditions}
      siteSettings={siteSettings}
    />
  )
}
