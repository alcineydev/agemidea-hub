import { z } from 'zod'

// ── AUTH ──

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

// ── LEADS / PRÉ-CADASTRO ──

export const leadSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  service_interest: z.string().optional(),
})

// ── CLIENTES ──

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const clientUpdateSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  is_active: z.boolean().optional(),
})

// ── PROJETOS ──

export const projectSchema = z.object({
  client_id: z.string().uuid('Cliente obrigatório'),
  title: z.string().min(2, 'Título obrigatório'),
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

// ── ETAPAS DO PROJETO ──

export const stageSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(2, 'Título obrigatório'),
  description: z.string().optional(),
  order_index: z.number().optional(),
})

// ── PÁGINAS (CMS) ──

export const pageSchema = z.object({
  title: z.string().min(2, 'Título obrigatório'),
  slug: z
    .string()
    .min(2, 'Slug obrigatório')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug inválido (use letras minúsculas, números e hífens)'
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

// ── BLOG CATEGORIAS ──

export const blogCategorySchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z
    .string()
    .min(2, 'Slug obrigatório')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  description: z.string().optional(),
  color: z.string().optional().default('#10B981'),
})

// ── BLOG TAGS ──

export const blogTagSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  slug: z
    .string()
    .min(1, 'Slug obrigatório')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
})

// ── BLOG POSTS ──

export const blogPostSchema = z.object({
  title: z.string().min(2, 'Título obrigatório'),
  slug: z
    .string()
    .min(2, 'Slug obrigatório')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  excerpt: z.string().optional(),
  content: z.string().optional().default(''),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  category_id: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['rascunho', 'publicado', 'agendado', 'arquivado']).optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  scheduled_for: z.string().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
})

export const blogPostUpdateSchema = blogPostSchema.partial()

// ── SUPORTE ──

export const ticketSchema = z.object({
  subject: z.string().min(2, 'Assunto obrigatório'),
  message: z.string().min(2, 'Mensagem obrigatória'),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
})

export const messageSchema = z.object({
  ticket_id: z.string().uuid(),
  content: z.string().min(1, 'Mensagem obrigatória'),
  type: z.enum(['text', 'file', 'system']).optional(),
  file_url: z.string().optional(),
  file_name: z.string().optional(),
})

// ── CONFIGURAÇÕES ──

export const siteSettingsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  favicon_url: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  whatsapp: z.string().optional(),
})

// ── TYPES INFERIDOS ──

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
