import { z } from 'zod'

const urlOrRelativePath = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true
    if (value.startsWith('/')) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }, 'URL inválida')

// â”€â”€ AUTH â”€â”€

export const loginSchema = z.object({
  email: z.string().email('Email invÃ¡lido'),
  password: z.string().min(6, 'MÃ­nimo 6 caracteres'),
})

// â”€â”€ LEADS / PRÃ‰-CADASTRO â”€â”€

export const leadSchema = z.object({
  name: z.string().min(2, 'Nome obrigatÃ³rio'),
  email: z.string().email('Email invÃ¡lido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  service_interest: z.string().optional(),
})

// â”€â”€ CLIENTES â”€â”€

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome obrigatÃ³rio'),
  email: z.string().email('Email invÃ¡lido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(6, 'MÃ­nimo 6 caracteres'),
})

export const clientUpdateSchema = z.object({
  name: z.string().min(2, 'Nome obrigatÃ³rio').optional(),
  email: z.string().email('Email invÃ¡lido').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  is_active: z.boolean().optional(),
})

// â”€â”€ PROJETOS â”€â”€

export const projectSchema = z.object({
  client_id: z.string().uuid('Cliente obrigatÃ³rio'),
  title: z.string().min(2, 'TÃ­tulo obrigatÃ³rio'),
  description: z.string().optional(),
  service_type: z.string().optional(),
  start_date: z.string().optional(),
  deadline: z.string().optional(),
  value: z.number().min(0).optional(),
})

export const projectUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z
    .enum(['briefing', 'em_andamento', 'revisao', 'concluido', 'cancelado'])
    .optional(),
  service_type: z.string().optional(),
  start_date: z.string().optional(),
  deadline: z.string().optional(),
  value: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).optional(),
})

// â”€â”€ ETAPAS DO PROJETO â”€â”€

export const stageSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(2, 'TÃ­tulo obrigatÃ³rio'),
  description: z.string().optional(),
  order_index: z.number().optional(),
})

// â”€â”€ PÃGINAS (CMS) â”€â”€

export const pageSchema = z.object({
  title: z.string().min(2, 'TÃ­tulo obrigatÃ³rio'),
  slug: z
    .string()
    .min(2, 'Slug obrigatÃ³rio')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug invÃ¡lido (use letras minÃºsculas, nÃºmeros e hÃ­fens)'
    ),
  html_content: z.string().optional().default(''),
  css_content: z.string().optional().default(''),
  js_content: z.string().optional().default(''),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.enum(['rascunho', 'publicada', 'desativada']).optional(),
  page_type: z.enum(['home', 'normal', '404', 'blog']).optional().default('normal'),
  show_in_menu: z.boolean().optional(),
  menu_order: z.number().optional(),
})

export const pageUpdateSchema = pageSchema.partial()

// â”€â”€ BLOG CATEGORIAS â”€â”€

export const blogCategorySchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z
    .string()
    .min(2, 'Slug obrigatório')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  description: z.string().optional(),
  color: z.string().optional().default('#10B981'),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(170).optional(),
  cover_image_url: urlOrRelativePath.optional().or(z.literal('')),
})
// ── BLOG TAGS â”€â”€

export const blogTagSchema = z.object({
  name: z.string().min(1, 'Nome obrigatÃ³rio'),
  slug: z
    .string()
    .min(1, 'Slug obrigatÃ³rio')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invÃ¡lido'),
})

// â”€â”€ BLOG POSTS â”€â”€

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
  slug: z
    .string()
    .min(3, 'Slug obrigatório')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  cover_image_url: urlOrRelativePath.optional().or(z.literal('')),
  cover_image_alt: z.string().max(200).optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['rascunho', 'publicado', 'agendado', 'arquivado']),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(170).optional(),
  focus_keyword: z.string().max(50).optional(),
  og_title: z.string().max(70).optional(),
  og_description: z.string().max(200).optional(),
  og_image_url: urlOrRelativePath.optional().or(z.literal('')),
  published_at: z.string().optional(),
  scheduled_for: z.string().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
})

export const blogPostUpdateSchema = blogPostSchema.partial()

// â”€â”€ SUPORTE â”€â”€

export const ticketSchema = z.object({
  subject: z.string().min(2, 'Assunto obrigatÃ³rio'),
  message: z.string().min(2, 'Mensagem obrigatÃ³ria'),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
})

export const messageSchema = z.object({
  ticket_id: z.string().uuid(),
  content: z.string().min(1, 'Mensagem obrigatÃ³ria'),
  type: z.enum(['text', 'file', 'system']).optional(),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
})

// â”€â”€ CONFIGURAÃ‡Ã•ES â”€â”€

export const siteSettingsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  favicon_url: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  whatsapp: z.string().optional(),
})

// â”€â”€ TYPES INFERIDOS â”€â”€

export type LoginInput = z.infer<typeof loginSchema>
export type LeadInput = z.infer<typeof leadSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type PageInput = z.infer<typeof pageSchema>
export type BlogCategoryInput = z.infer<typeof blogCategorySchema>
export type BlogTagInput = z.infer<typeof blogTagSchema>
export type BlogPostInput = z.infer<typeof blogPostSchema>
export type TicketInput = z.infer<typeof ticketSchema>
export type MessageInput = z.infer<typeof messageSchema>


