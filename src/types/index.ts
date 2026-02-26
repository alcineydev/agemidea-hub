// ── ENUMS ──

export type UserRole = 'admin' | 'client'
export type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'descartado'
export type ProjectStatus =
  | 'briefing'
  | 'em_andamento'
  | 'revisao'
  | 'concluido'
  | 'cancelado'
export type TicketStatus =
  | 'aberto'
  | 'em_atendimento'
  | 'aguardando_cliente'
  | 'resolvido'
  | 'fechado'
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente'
export type MessageType = 'text' | 'file' | 'system'
export type PageStatus = 'rascunho' | 'publicada' | 'desativada'
export type PostStatus = 'rascunho' | 'publicado' | 'agendado' | 'arquivado'

// ── PROFILES ──

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  name: string
  email: string
  phone: string | null
  company: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  user_id: string
  role?: UserRole
  name: string
  email: string
  phone?: string | null
  company?: string | null
  avatar_url?: string | null
}

export interface ProfileUpdate {
  name?: string
  email?: string
  phone?: string | null
  company?: string | null
  avatar_url?: string | null
  is_active?: boolean
}

// ── LEADS ──

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string | null
  service_interest: string | null
  status: LeadStatus
  notes: string | null
  converted_to: string | null
  created_at: string
  updated_at: string
}

export interface LeadInsert {
  name: string
  email: string
  phone?: string | null
  company?: string | null
  message?: string | null
  service_interest?: string | null
}

export interface LeadUpdate {
  status?: LeadStatus
  notes?: string | null
  converted_to?: string | null
}

// ── PROJECTS ──

export interface Project {
  id: string
  client_id: string
  title: string
  description: string | null
  status: ProjectStatus
  service_type: string | null
  start_date: string | null
  deadline: string | null
  value: number | null
  progress: number
  created_at: string
  updated_at: string
  client?: Profile
  stages?: ProjectStage[]
  files?: ProjectFile[]
}

export interface ProjectInsert {
  client_id: string
  title: string
  description?: string | null
  status?: ProjectStatus
  service_type?: string | null
  start_date?: string | null
  deadline?: string | null
  value?: number | null
}

export interface ProjectUpdate {
  title?: string
  description?: string | null
  status?: ProjectStatus
  service_type?: string | null
  start_date?: string | null
  deadline?: string | null
  value?: number | null
  progress?: number
}

// ── PROJECT STAGES ──

export interface ProjectStage {
  id: string
  project_id: string
  title: string
  description: string | null
  order_index: number
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

export interface ProjectStageInsert {
  project_id: string
  title: string
  description?: string | null
  order_index?: number
}

// ── PROJECT FILES ──

export interface ProjectFile {
  id: string
  project_id: string
  uploaded_by: string
  file_name: string
  file_url: string
  file_size: number | null
  file_type: string | null
  description: string | null
  created_at: string
  uploader?: Profile
}

// ── PAGES (CMS) ──

export interface Page {
  id: string
  title: string
  slug: string
  html_content: string
  css_content: string
  js_content: string
  meta_title: string | null
  meta_description: string | null
  status: PageStatus
  page_type: 'home' | 'normal' | '404' | 'blog'
  display_mode: 'body' | 'fullscreen'
  show_in_menu: boolean
  menu_order: number
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
  creator?: Profile
}

export interface PageInsert {
  title: string
  slug: string
  html_content?: string
  css_content?: string
  js_content?: string
  meta_title?: string | null
  meta_description?: string | null
  status?: PageStatus
  page_type?: 'home' | 'normal' | '404' | 'blog'
  display_mode?: 'body' | 'fullscreen'
  show_in_menu?: boolean
  menu_order?: number
  created_by: string
}

export interface PageUpdate {
  title?: string
  slug?: string
  html_content?: string
  css_content?: string
  js_content?: string
  meta_title?: string | null
  meta_description?: string | null
  status?: PageStatus
  page_type?: 'home' | 'normal' | '404' | 'blog'
  display_mode?: 'body' | 'fullscreen'
  show_in_menu?: boolean
  menu_order?: number
  updated_by?: string
}

// ── BLOG CATEGORIES ──

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  order_index: number
  created_at: string
  posts_count?: number
}

export interface BlogCategoryInsert {
  name: string
  slug: string
  description?: string | null
  color?: string
  order_index?: number
}

// ── BLOG TAGS ──

export interface BlogTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface BlogTagInsert {
  name: string
  slug: string
}

// ── BLOG POSTS ──

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  category_id: string | null
  author_id: string
  status: PostStatus
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  scheduled_for: string | null
  views_count: number
  created_at: string
  updated_at: string
  category?: BlogCategory
  author?: Profile
  tags?: BlogTag[]
}

export interface BlogPostInsert {
  title: string
  slug: string
  excerpt?: string | null
  content?: string
  cover_image_url?: string | null
  category_id?: string | null
  author_id: string
  status?: PostStatus
  meta_title?: string | null
  meta_description?: string | null
  scheduled_for?: string | null
  tag_ids?: string[]
}

export interface BlogPostUpdate {
  title?: string
  slug?: string
  excerpt?: string | null
  content?: string
 cover_image_url?: string | null
  category_id?: string | null
  status?: PostStatus
  meta_title?: string | null
  meta_description?: string | null
  published_at?: string | null
  scheduled_for?: string | null
  tag_ids?: string[]
}

// ── SUPPORT TICKETS ──

export interface SupportTicket {
  id: string
  client_id: string
  assigned_to: string | null
  subject: string
  status: TicketStatus
  priority: TicketPriority
  closed_at: string | null
  created_at: string
  updated_at: string
  client?: Profile
  assignee?: Profile
  messages?: SupportMessage[]
  last_message?: SupportMessage
  unread_count?: number
}

export interface SupportTicketInsert {
  client_id: string
  subject: string
  priority?: TicketPriority
}

export interface SupportTicketUpdate {
  assigned_to?: string | null
  subject?: string
  status?: TicketStatus
  priority?: TicketPriority
  closed_at?: string | null
}

// ── SUPPORT MESSAGES ──

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  content: string
  type: MessageType
  file_url: string | null
  file_name: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  sender?: Profile
}

export interface SupportMessageInsert {
  ticket_id: string
  sender_id: string
  content: string
  type?: MessageType
  file_url?: string | null
  file_name?: string | null
}

// ── NOTIFICATIONS ──

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  link: string | null
  is_read: boolean
  created_at: string
}

// ── ACTIVITY LOGS ──

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  user?: Profile
}

// ── SETTINGS ──

export interface SiteSettings {
  name: string
  description: string
  logo_url: string
  favicon_url: string
  contact_email: string
  contact_phone: string
  whatsapp: string
}

export interface SeoSettings {
  default_title: string
  default_description: string
  og_image: string
}

export interface SocialSettings {
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
}

// ── DASHBOARD ──

export interface DashboardStats {
  total_clients: number
  active_projects: number
  open_tickets: number
  new_leads: number
  monthly_revenue: number
  total_posts: number
  total_pages: number
}

export interface DashboardChartData {
  label: string
  value: number
}

// ── API RESPONSES ──

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
