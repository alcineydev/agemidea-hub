import OrcamentosConfigClient from './OrcamentosConfigClient'
import { getSettings } from '@/app/(painel)/painel/configuracoes/actions'
import type { PaymentCondition, QuoteSettings } from '@/types/quotes'
import {
  getPaymentConditions,
  getQuoteSettings,
} from '../_actions'

export default async function OrcamentosConfiguracaoPage() {
  let quoteSettings: QuoteSettings = {
    id: '',
    prefix: 'ORC',
    separator: '-',
    include_year: true,
    year_digits: 4,
    sequential_digits: 3,
    next_number: 1,
    logo_url: null,
    logo_position: 'left',
    logo_size: 'medium',
    primary_color: '#0ea5e9',
    text_color: '#1e293b',
    bg_color: '#ffffff',
    footer_text: null,
    show_page_number: true,
    company_name: null,
    company_document: null,
    company_email: null,
    company_phone: null,
    company_address: null,
    company_website: null,
    default_observation: null,
    default_terms: null,
    default_validity_days: 15,
    updated_by: null,
    updated_at: new Date().toISOString(),
  }
  let paymentConditions: PaymentCondition[] = []
  let siteSettings: Record<string, string> = {}

  try {
    quoteSettings = await getQuoteSettings()
  } catch (error) {
    console.error('Erro ao carregar configuracoes em /painel/orcamentos/configuracao:', error)
  }

  try {
    paymentConditions = await getPaymentConditions()
  } catch (error) {
    console.error('Erro ao carregar condicoes em /painel/orcamentos/configuracao:', error)
  }

  try {
    siteSettings = await getSettings()
  } catch (error) {
    console.error('Erro ao carregar site settings em /painel/orcamentos/configuracao:', error)
  }

  return (
    <OrcamentosConfigClient
      initialSettings={quoteSettings}
      paymentConditions={paymentConditions}
      siteSettings={siteSettings}
    />
  )
}
