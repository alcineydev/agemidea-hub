export type DocumentType = 'cpf' | 'cnpj'

export interface Client {
  id: string
  name: string
  trade_name: string | null
  document_type: DocumentType
  document: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>
export type ClientUpdate = Partial<ClientInsert>

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export const QUOTE_STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; color: string; bg: string }
> = {
  draft: { label: 'Rascunho', color: '#a78bfa', bg: '#1e1b4b' },
  sent: { label: 'Enviado', color: '#eab308', bg: '#422006' },
  approved: { label: 'Aprovado', color: '#22c55e', bg: '#052e16' },
  rejected: { label: 'Recusado', color: '#ef4444', bg: '#450a0a' },
}

export interface PaymentInstallment {
  label: string
  percent: number
}

export interface PaymentCondition {
  id: string
  name: string
  description: string | null
  installments: PaymentInstallment[]
  discount_percent: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Quote {
  id: string
  quote_number: string
  title: string | null
  client_id: string
  payment_condition_id: string | null
  status: QuoteStatus
  subtotal: number
  discount_total: number
  total: number
  payment_condition_name: string | null
  payment_installments: PaymentInstallment[]
  observation: string | null
  terms: string | null
  valid_until: string | null
  public_token: string | null
  sent_at: string | null
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  client?: Client
  items?: QuoteItem[]
}

export type QuoteInsert = Pick<
  Quote,
  | 'title'
  | 'client_id'
  | 'payment_condition_id'
  | 'payment_condition_name'
  | 'payment_installments'
  | 'observation'
  | 'terms'
  | 'valid_until'
>

export type QuoteUpdate = Partial<QuoteInsert> & {
  status?: QuoteStatus
}

export interface QuoteItem {
  id: string
  quote_id: string
  service_name: string
  description: string | null
  quantity: number
  unit_price: number
  discount_percent: number
  subtotal: number
  sort_order: number
  created_at: string
}

export type QuoteItemInsert = Omit<QuoteItem, 'id' | 'created_at' | 'subtotal'> & {
  subtotal?: number
}

export interface QuoteSettings {
  id: string
  prefix: string
  separator: string
  include_year: boolean
  year_digits: number
  sequential_digits: number
  next_number: number
  logo_url: string | null
  logo_position: 'left' | 'center' | 'right'
  logo_size: 'small' | 'medium' | 'large'
  primary_color: string
  text_color: string
  bg_color: string
  footer_text: string | null
  show_page_number: boolean
  company_name: string | null
  company_document: string | null
  company_email: string | null
  company_phone: string | null
  company_address: string | null
  company_website: string | null
  default_observation: string | null
  default_terms: string | null
  default_validity_days: number
  updated_by: string | null
  updated_at: string
}

export interface QuoteHistory {
  id: string
  quote_id: string
  from_status: QuoteStatus | null
  to_status: QuoteStatus
  changed_by: string | null
  notes: string | null
  ip_address: string | null
  created_at: string
  profile?: {
    name: string
    email: string
  } | null
}

export interface QuoteListItem {
  id: string
  quote_number: string
  title: string | null
  status: QuoteStatus
  total: number
  valid_until: string | null
  created_at: string
  public_token?: string | null
  client: {
    name: string
    email: string | null
  }
}

export interface QuoteStats {
  total: number
  draft: number
  sent: number
  approved: number
  rejected: number
  total_approved_value: number
}

export interface QuoteFormInput {
  title?: string
  client_id: string
  payment_condition_id?: string | null
  payment_condition_name?: string
  payment_installments: PaymentInstallment[]
  observation?: string
  terms?: string
  valid_until?: string | null
  items: Array<{
    service_name: string
    description?: string
    quantity: number
    unit_price: number
    discount_percent?: number
    sort_order?: number
  }>
}
