import { z } from 'zod'

const optionalString = z.string().optional().or(z.literal(''))

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome e obrigatorio (min. 2 caracteres)'),
  trade_name: optionalString,
  document_type: z.enum(['cpf', 'cnpj']).default('cpf'),
  document: optionalString,
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: optionalString,
  whatsapp: optionalString,
  address_street: optionalString,
  address_number: optionalString,
  address_complement: optionalString,
  address_neighborhood: optionalString,
  address_city: optionalString,
  address_state: z.string().max(2).optional().or(z.literal('')),
  address_zip: optionalString,
  notes: optionalString,
})

export const quoteItemSchema = z.object({
  service_name: z.string().min(2, 'Nome do servico e obrigatorio'),
  description: optionalString,
  quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unit_price: z.coerce.number().min(0.01, 'Valor deve ser maior que 0'),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  sort_order: z.coerce.number().default(0),
})

export const quoteSchema = z.object({
  title: optionalString,
  client_id: z.string().uuid('Cliente e obrigatorio'),
  payment_condition_id: z.string().uuid().optional().nullable(),
  payment_condition_name: optionalString,
  payment_installments: z
    .array(
      z.object({
        label: z.string(),
        percent: z.number(),
      })
    )
    .default([]),
  observation: optionalString,
  terms: optionalString,
  valid_until: z.string().optional().nullable(),
  items: z.array(quoteItemSchema).min(1, 'Adicione pelo menos 1 servico'),
})

export const quoteSettingsSchema = z.object({
  prefix: z.string().min(1).max(10),
  separator: z.string().max(2),
  include_year: z.boolean(),
  year_digits: z.coerce.number().refine((v) => v === 2 || v === 4),
  sequential_digits: z.coerce.number().min(1).max(6),
  logo_url: optionalString.nullable(),
  logo_position: z.enum(['left', 'center', 'right']),
  logo_size: z.enum(['small', 'medium', 'large']),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  text_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  bg_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  footer_text: optionalString.nullable(),
  show_page_number: z.boolean(),
  company_name: optionalString.nullable(),
  company_document: optionalString.nullable(),
  company_email: optionalString.nullable(),
  company_phone: optionalString.nullable(),
  company_address: optionalString.nullable(),
  company_website: optionalString.nullable(),
  default_observation: optionalString.nullable(),
  default_terms: optionalString.nullable(),
  default_validity_days: z.coerce.number().min(1).max(365),
})

export const paymentConditionSchema = z.object({
  name: z.string().min(2, 'Nome e obrigatorio'),
  description: optionalString,
  installments: z
    .array(
      z.object({
        label: z.string().min(1),
        percent: z.number().min(0).max(100),
      })
    )
    .min(1, 'Adicione pelo menos 1 parcela')
    .refine(
      (items) => Math.abs(items.reduce((sum, item) => sum + item.percent, 0) - 100) < 0.0001,
      'As parcelas devem somar 100%'
    ),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().default(0),
})

export type ClientSchemaInput = z.infer<typeof clientSchema>
export type QuoteSchemaInput = z.infer<typeof quoteSchema>
export type QuoteSettingsSchemaInput = z.infer<typeof quoteSettingsSchema>
export type PaymentConditionSchemaInput = z.infer<typeof paymentConditionSchema>
