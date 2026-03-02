'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { createAdminClient, createServerClient } from '@/lib/supabase/server'
import {
  clientSchema,
  paymentConditionSchema,
  quoteSchema,
  quoteSettingsSchema,
} from '@/lib/validations/quotes'
import type {
  Client,
  ClientInsert,
  PaymentCondition,
  Quote,
  QuoteFormInput,
  QuoteHistory,
  QuoteListItem,
  QuoteSettings,
  QuoteStats,
  QuoteStatus,
} from '@/types/quotes'

function emptyToNull(value: string | null | undefined) {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeClientPayload(input: Record<string, unknown>) {
  return {
    ...input,
    trade_name: emptyToNull(input.trade_name as string | null | undefined),
    document: emptyToNull(input.document as string | null | undefined),
    email: emptyToNull(input.email as string | null | undefined),
    phone: emptyToNull(input.phone as string | null | undefined),
    whatsapp: emptyToNull(input.whatsapp as string | null | undefined),
    address_street: emptyToNull(input.address_street as string | null | undefined),
    address_number: emptyToNull(input.address_number as string | null | undefined),
    address_complement: emptyToNull(input.address_complement as string | null | undefined),
    address_neighborhood: emptyToNull(input.address_neighborhood as string | null | undefined),
    address_city: emptyToNull(input.address_city as string | null | undefined),
    address_state: emptyToNull(input.address_state as string | null | undefined),
    address_zip: emptyToNull(input.address_zip as string | null | undefined),
    notes: emptyToNull(input.notes as string | null | undefined),
  }
}

function normalizeQuotePayload(input: Record<string, unknown>) {
  return {
    ...input,
    title: emptyToNull(input.title as string | null | undefined),
    payment_condition_name: emptyToNull(input.payment_condition_name as string | null | undefined),
    observation: emptyToNull(input.observation as string | null | undefined),
    terms: emptyToNull(input.terms as string | null | undefined),
    valid_until: emptyToNull(input.valid_until as string | null | undefined),
  }
}

function getDefaultQuoteSettings(): QuoteSettings {
  return {
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
}

async function getAuthenticatedUserId() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ---------------------------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------------------------

export async function getClients(search?: string) {
  const supabase = createAdminClient()
  let query = supabase.from('clients').select('*').order('name')

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,document.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('Erro ao carregar clientes:', error)
    return [] as Client[]
  }
  return (data ?? []) as Client[]
}

export async function getClientById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
  if (error || !data) {
    console.error('Erro ao carregar cliente por ID:', error)
    return null
  }
  return data as Client
}

export async function createClient(formData: ClientInsert) {
  const parsed = clientSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const payload = normalizeClientPayload(parsed.data)
  const userId = await getAuthenticatedUserId()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...payload,
      created_by: userId,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/painel/orcamentos')
  revalidatePath('/painel/orcamentos/novo')
  return { data: data as Client }
}

export async function updateClient(id: string, formData: Partial<ClientInsert>) {
  const parsed = clientSchema.partial().safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createAdminClient()
  const payload = normalizeClientPayload(parsed.data)
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/painel/orcamentos')
  return { data: data as Client }
}

// ---------------------------------------------------------------------------
// QUOTES
// ---------------------------------------------------------------------------

export async function getQuotes(filters?: {
  status?: QuoteStatus
  search?: string
  page?: number
  perPage?: number
}) {
  const supabase = createAdminClient()
  const page = filters?.page ?? 1
  const perPage = filters?.perPage ?? 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('quotes')
    .select(
      `
      id, quote_number, title, status, total, valid_until, created_at, public_token,
      client:clients(name, email)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.search) {
    query = query.or(`quote_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
  }

  const { data, error, count } = await query
  if (error || !data) {
    console.error('Erro ao carregar orcamentos:', error)
    return { data: [] as QuoteListItem[], total: 0 }
  }

  const normalized = (data ?? []).map((row) => {
    const rawClient = (row as { client?: { name: string; email: string | null }[] | { name: string; email: string | null } }).client
    const client = Array.isArray(rawClient) ? rawClient[0] : rawClient

    return {
      id: row.id,
      quote_number: row.quote_number,
      title: row.title,
      status: row.status,
      total: Number(row.total ?? 0),
      valid_until: row.valid_until,
      created_at: row.created_at,
      public_token: row.public_token,
      client: {
        name: client?.name ?? '-',
        email: client?.email ?? null,
      },
    } satisfies QuoteListItem
  })

  return { data: normalized, total: count ?? 0 }
}

export async function getQuoteById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(*), items:quote_items(*)')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'quote_items', ascending: true })
    .single()

  if (error || !data) {
    console.error('Erro ao carregar orcamento por ID:', error)
    return null
  }
  return data as Quote
}

export async function getQuoteByToken(token: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(*), items:quote_items(*)')
    .eq('public_token', token)
    .order('sort_order', { referencedTable: 'quote_items', ascending: true })
    .single()

  if (error) return null
  return data as Quote
}

export async function getPublicQuoteView(token: string) {
  const supabase = createAdminClient()
  const { data: quote } = await supabase
    .from('quotes')
    .select('*, client:clients(*), items:quote_items(*)')
    .eq('public_token', token)
    .order('sort_order', { referencedTable: 'quote_items', ascending: true })
    .single()

  if (!quote) return null

  const { data: settings } = await supabase.from('quote_settings').select('*').limit(1).maybeSingle()
  return {
    quote: quote as Quote,
    settings: (settings ?? null) as QuoteSettings | null,
  }
}

export async function getQuoteHistory(quoteId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('quote_history')
    .select('*')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Erro ao carregar historico do orcamento:', error)
    return [] as QuoteHistory[]
  }
  return (data ?? []) as QuoteHistory[]
}

export async function getQuoteStats(): Promise<QuoteStats> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('quotes').select('status, total')
  if (error || !data) {
    console.error('Erro ao carregar estatisticas de orcamentos:', error)
    return {
      total: 0,
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      total_approved_value: 0,
    }
  }

  const stats: QuoteStats = {
    total: data?.length ?? 0,
    draft: 0,
    sent: 0,
    approved: 0,
    rejected: 0,
    total_approved_value: 0,
  }

  for (const item of data ?? []) {
    const status = item.status as QuoteStatus
    stats[status] += 1
    if (status === 'approved') stats.total_approved_value += Number(item.total ?? 0)
  }

  return stats
}

export async function createQuote(formData: QuoteFormInput) {
  const parsed = quoteSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const userId = await getAuthenticatedUserId()
  const supabase = createAdminClient()

  const { data: quoteNumber, error: quoteNumberError } = await supabase.rpc('generate_quote_number')
  if (quoteNumberError || !quoteNumber) return { error: quoteNumberError?.message ?? 'Erro ao gerar numero' }

  const { data: publicToken, error: tokenError } = await supabase.rpc('generate_public_token')
  if (tokenError || !publicToken) return { error: tokenError?.message ?? 'Erro ao gerar token' }

  const { data: settings } = await supabase
    .from('quote_settings')
    .select('default_observation, default_terms, default_validity_days')
    .limit(1)
    .maybeSingle()

  const validUntil =
    parsed.data.valid_until ??
    new Date(Date.now() + (settings?.default_validity_days ?? 15) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

  const { items, ...rawQuote } = parsed.data
  const quoteData = normalizeQuotePayload(rawQuote)

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      ...quoteData,
      quote_number: quoteNumber,
      public_token: publicToken,
      status: 'draft',
      observation: quoteData.observation ?? settings?.default_observation ?? null,
      terms: quoteData.terms ?? settings?.default_terms ?? null,
      valid_until: validUntil,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single()

  if (quoteError || !quote) return { error: quoteError?.message ?? 'Erro ao criar orcamento' }

  const itemsToInsert = items.map((item, index) => ({
    quote_id: quote.id,
    service_name: item.service_name,
    description: emptyToNull(item.description),
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percent: item.discount_percent ?? 0,
    subtotal: item.quantity * item.unit_price * (1 - (item.discount_percent ?? 0) / 100),
    sort_order: item.sort_order ?? index,
  }))

  const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert)
  if (itemsError) return { error: itemsError.message }

  await supabase.from('quote_history').insert({
    quote_id: quote.id,
    to_status: 'draft',
    changed_by: userId,
  })

  revalidatePath('/painel/orcamentos')
  revalidatePath('/painel/orcamentos/novo')
  revalidatePath(`/painel/orcamentos/${quote.id}`)
  return { data: quote as Quote }
}

export async function updateQuote(id: string, formData: QuoteFormInput) {
  const parsed = quoteSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const userId = await getAuthenticatedUserId()
  const supabase = createAdminClient()

  const { data: current } = await supabase.from('quotes').select('status').eq('id', id).single()
  if (!current) return { error: 'Orcamento nao encontrado' }
  if (current.status !== 'draft') return { error: 'Apenas rascunhos podem ser editados' }

  const { items, ...rawQuote } = parsed.data
  const quoteData = normalizeQuotePayload(rawQuote)

  const { data: quote, error } = await supabase
    .from('quotes')
    .update({
      ...quoteData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !quote) return { error: error?.message ?? 'Erro ao atualizar orcamento' }

  const { error: deleteError } = await supabase.from('quote_items').delete().eq('quote_id', id)
  if (deleteError) return { error: deleteError.message }

  const itemsToInsert = items.map((item, index) => ({
    quote_id: id,
    service_name: item.service_name,
    description: emptyToNull(item.description),
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percent: item.discount_percent ?? 0,
    subtotal: item.quantity * item.unit_price * (1 - (item.discount_percent ?? 0) / 100),
    sort_order: item.sort_order ?? index,
  }))

  const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert)
  if (itemsError) return { error: itemsError.message }

  revalidatePath('/painel/orcamentos')
  revalidatePath(`/painel/orcamentos/${id}`)
  return { data: quote as Quote }
}

export async function updateQuoteStatus(
  id: string,
  newStatus: QuoteStatus,
  options?: { rejection_reason?: string; ip_address?: string | null }
) {
  const userId = await getAuthenticatedUserId()
  const supabase = createAdminClient()

  const { data: current } = await supabase
    .from('quotes')
    .select('status, public_token')
    .eq('id', id)
    .single()

  if (!current) return { error: 'Orcamento nao encontrado' }

  const validTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ['sent'],
    sent: ['approved', 'rejected', 'draft'],
    approved: [],
    rejected: ['draft'],
  }

  if (!validTransitions[current.status as QuoteStatus]?.includes(newStatus)) {
    return { error: `Transicao de "${current.status}" para "${newStatus}" nao permitida` }
  }

  const now = new Date().toISOString()
  const payload: Record<string, string | QuoteStatus | null> = {
    status: newStatus,
    updated_at: now,
    updated_by: userId,
    sent_at: newStatus === 'sent' ? now : null,
    approved_at: newStatus === 'approved' ? now : null,
    rejected_at: newStatus === 'rejected' ? now : null,
    rejection_reason: newStatus === 'rejected' ? emptyToNull(options?.rejection_reason) : null,
  }

  const { data, error } = await supabase.from('quotes').update(payload).eq('id', id).select().single()
  if (error) return { error: error.message }

  await supabase.from('quote_history').insert({
    quote_id: id,
    from_status: current.status,
    to_status: newStatus,
    changed_by: userId,
    notes: emptyToNull(options?.rejection_reason),
    ip_address: options?.ip_address ?? null,
  })

  revalidatePath('/painel/orcamentos')
  revalidatePath(`/painel/orcamentos/${id}`)
  if (current.public_token) revalidatePath(`/orcamento/${current.public_token}`)
  return { data: data as Quote }
}

export async function deleteQuote(id: string) {
  const supabase = createAdminClient()
  const { data: quote } = await supabase.from('quotes').select('status').eq('id', id).single()

  if (!quote) return { error: 'Orcamento nao encontrado' }
  if (quote.status !== 'draft') return { error: 'Apenas rascunhos podem ser excluidos' }

  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/painel/orcamentos')
  return { success: true }
}

export async function generateQuotePublicLink(id: string) {
  const supabase = createAdminClient()

  const { data: current, error: currentError } = await supabase
    .from('quotes')
    .select('id, public_token')
    .eq('id', id)
    .single()

  if (currentError || !current) return { error: 'Orcamento nao encontrado' }
  if (current.public_token) return { data: current.public_token }

  const { data: token, error: tokenError } = await supabase.rpc('generate_public_token')
  if (tokenError || !token) return { error: tokenError?.message ?? 'Nao foi possivel gerar token' }

  const { error: updateError } = await supabase
    .from('quotes')
    .update({
      public_token: token,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/painel/orcamentos')
  revalidatePath(`/painel/orcamentos/${id}`)
  revalidatePath(`/orcamento/${token}`)
  return { data: token as string }
}

export async function revokeQuotePublicLink(id: string) {
  const supabase = createAdminClient()
  const { data: current } = await supabase
    .from('quotes')
    .select('public_token')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('quotes')
    .update({
      public_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/painel/orcamentos')
  revalidatePath(`/painel/orcamentos/${id}`)
  if (current?.public_token) revalidatePath(`/orcamento/${current.public_token}`)
  return { success: true }
}

// ---------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------

export async function getQuoteSettings() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('quote_settings').select('*').limit(1).maybeSingle()

  if (error || !data) {
    console.error('Erro ao carregar configuracoes de orcamento:', error)
    return getDefaultQuoteSettings()
  }

  return data as QuoteSettings
}

export async function updateQuoteSettings(formData: Partial<QuoteSettings>) {
  const parsed = quoteSettingsSchema.partial().safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const userId = await getAuthenticatedUserId()
  const supabase = createAdminClient()

  const { data: existing } = await supabase.from('quote_settings').select('id').limit(1).maybeSingle()
  const payload = {
    ...parsed.data,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }

  if (!existing?.id) {
    const { data: inserted, error: insertError } = await supabase
      .from('quote_settings')
      .insert(payload)
      .select()
      .single()

    if (insertError) return { error: insertError.message }
    revalidatePath('/painel/orcamentos/configuracao')
    return { data: inserted as QuoteSettings }
  }

  const { data, error } = await supabase
    .from('quote_settings')
    .update(payload)
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/painel/orcamentos/configuracao')
  revalidatePath('/painel/orcamentos/novo')
  return { data: data as QuoteSettings }
}

// ---------------------------------------------------------------------------
// PAYMENT CONDITIONS
// ---------------------------------------------------------------------------

export async function getPaymentConditions() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('payment_conditions')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error || !data) {
    console.error('Erro ao carregar condicoes de pagamento:', error)
    return [] as PaymentCondition[]
  }

  return data as PaymentCondition[]
}

export async function createPaymentCondition(formData: Partial<PaymentCondition>) {
  const parsed = paymentConditionSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('payment_conditions')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/painel/orcamentos/configuracao')
  return { data: data as PaymentCondition }
}

export async function updatePaymentCondition(id: string, formData: Partial<PaymentCondition>) {
  const parsed = paymentConditionSchema.partial().safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('payment_conditions')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/painel/orcamentos/configuracao')
  return { data: data as PaymentCondition }
}

export async function deletePaymentCondition(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('payment_conditions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/painel/orcamentos/configuracao')
  return { success: true }
}

// ---------------------------------------------------------------------------
// PUBLIC ACTIONS
// ---------------------------------------------------------------------------

export async function publicUpdateQuoteStatus(
  token: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
) {
  const supabase = createAdminClient()
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, status, valid_until, public_token')
    .eq('public_token', token)
    .single()

  if (!quote) return { error: 'Orcamento nao encontrado' }
  if (quote.status !== 'sent') return { error: 'Este orcamento nao esta aguardando resposta' }

  if (quote.valid_until && new Date(quote.valid_until) < new Date(new Date().toISOString().split('T')[0])) {
    return { error: 'Este orcamento expirou' }
  }

  const nextStatus: QuoteStatus = action === 'approve' ? 'approved' : 'rejected'
  const now = new Date().toISOString()
  const payload: Record<string, string | QuoteStatus | null> = {
    status: nextStatus,
    updated_at: now,
    approved_at: nextStatus === 'approved' ? now : null,
    rejected_at: nextStatus === 'rejected' ? now : null,
    rejection_reason: nextStatus === 'rejected' ? emptyToNull(rejectionReason) : null,
  }

  const { data, error } = await supabase
    .from('quotes')
    .update(payload)
    .eq('id', quote.id)
    .eq('status', 'sent')
    .select()
    .single()

  if (error || !data) return { error: error?.message ?? 'Nao foi possivel atualizar o status' }

  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0]?.trim() : null

  await supabase.from('quote_history').insert({
    quote_id: quote.id,
    from_status: 'sent',
    to_status: nextStatus,
    changed_by: null,
    notes: nextStatus === 'rejected' ? emptyToNull(rejectionReason) : null,
    ip_address: ipAddress,
  })

  revalidatePath('/painel/orcamentos')
  revalidatePath(`/orcamento/${token}`)
  return { data: data as Quote }
}
