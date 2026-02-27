'use server'

import { revalidatePath } from 'next/cache'

import { getAuthenticatedProfileId } from '@/lib/auth-helpers'
import { createServerClient } from '@/lib/supabase/server'

export type ModelType = 'header' | 'footer' | 'popup' | 'card'
export type VisibilityMode = 'all' | 'specific' | 'exclude'
export type PopupTrigger = 'page_load' | 'exit_intent' | 'scroll_percent' | 'timer' | 'click'
export type PopupFrequency = 'always' | 'once' | 'once_per_session' | 'once_per_day'
export type ModelStatus = 'ativo' | 'inativo'

export interface ModelFormData {
  name: string
  description: string
  model_type: ModelType
  html_content: string
  css_content: string
  js_content: string
  visibility_mode: VisibilityMode
  visibility_pages: string[]
  popup_trigger?: PopupTrigger | null
  popup_delay_seconds?: number
  popup_scroll_percent?: number
  popup_show_frequency?: PopupFrequency
  popup_close_on_overlay?: boolean
  popup_mobile_enabled?: boolean
  status: ModelStatus
  priority: number
}

export interface ModelRecord {
  id: string
  name: string
  description: string | null
  model_type: ModelType
  html_content: string
  css_content: string
  js_content: string
  visibility_mode: VisibilityMode
  visibility_pages: string[] | null
  popup_trigger: PopupTrigger | null
  popup_delay_seconds: number
  popup_scroll_percent: number
  popup_show_frequency: PopupFrequency
  popup_close_on_overlay: boolean
  popup_mobile_enabled: boolean
  status: ModelStatus
  priority: number
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ModelFilters {
  type?: string
  search?: string
  status?: string
}

interface ModelGroups {
  headers: ModelRecord[]
  footers: ModelRecord[]
  popups: ModelRecord[]
  cards: ModelRecord[]
}

const EMPTY_GROUPS: ModelGroups = {
  headers: [],
  footers: [],
  popups: [],
  cards: [],
}

export async function getModels(filters?: ModelFilters) {
  const supabase = await createServerClient()

  let query = supabase
    .from('models')
    .select('*')
    .order('model_type', { ascending: true })
    .order('priority', { ascending: true })
    .order('updated_at', { ascending: false })

  if (filters?.type && filters.type !== 'todos') {
    query = query.eq('model_type', filters.type)
  }

  if (filters?.status && filters.status !== 'todos') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as ModelRecord[]
}

export async function getModelById(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from('models').select('*').eq('id', id).single()

  if (error) throw new Error(error.message)
  return data as ModelRecord
}

export async function getActiveModelsByType(type: ModelType) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('model_type', type)
    .eq('status', 'ativo')
    .order('priority', { ascending: true })

  if (error) return []
  return (data ?? []) as ModelRecord[]
}

function shouldShowModel(model: ModelRecord, pageId: string): boolean {
  const pages = model.visibility_pages ?? []

  if (model.visibility_mode === 'all') return true
  if (model.visibility_mode === 'specific') return pages.includes(pageId)
  if (model.visibility_mode === 'exclude') return !pages.includes(pageId)
  return false
}

export async function getModelsForPage(pageId: string): Promise<ModelGroups> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('status', 'ativo')
    .order('model_type', { ascending: true })
    .order('priority', { ascending: true })

  if (error || !data) return EMPTY_GROUPS

  const visible = (data as ModelRecord[]).filter((model) => shouldShowModel(model, pageId))

  return {
    headers: visible.filter((model) => model.model_type === 'header'),
    footers: visible.filter((model) => model.model_type === 'footer'),
    popups: visible.filter((model) => model.model_type === 'popup'),
    cards: visible.filter((model) => model.model_type === 'card'),
  }
}

function buildPopupData(formData: ModelFormData) {
  if (formData.model_type !== 'popup') {
    return {
      popup_trigger: null,
      popup_delay_seconds: 0,
      popup_scroll_percent: 50,
      popup_show_frequency: 'always' as const,
      popup_close_on_overlay: true,
      popup_mobile_enabled: true,
    }
  }

  return {
    popup_trigger: formData.popup_trigger ?? 'page_load',
    popup_delay_seconds: formData.popup_delay_seconds ?? 0,
    popup_scroll_percent: formData.popup_scroll_percent ?? 50,
    popup_show_frequency: formData.popup_show_frequency ?? 'always',
    popup_close_on_overlay: formData.popup_close_on_overlay ?? true,
    popup_mobile_enabled: formData.popup_mobile_enabled ?? true,
  }
}

export async function createModel(formData: ModelFormData) {
  const supabase = await createServerClient()
  const profileId = await getAuthenticatedProfileId()

  const insertData = {
    name: formData.name,
    description: formData.description || '',
    model_type: formData.model_type,
    html_content: formData.html_content,
    css_content: formData.css_content,
    js_content: formData.js_content,
    visibility_mode: formData.visibility_mode,
    visibility_pages: formData.visibility_pages || [],
    status: formData.status,
    priority: formData.priority || 0,
    created_by: profileId,
    ...buildPopupData(formData),
  }

  const { data, error } = await supabase.from('models').insert(insertData).select().single()
  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas/modelos')
  revalidatePath('/')
  return data as ModelRecord
}

export async function updateModel(id: string, formData: ModelFormData) {
  const supabase = await createServerClient()

  const updateData = {
    name: formData.name,
    description: formData.description || '',
    model_type: formData.model_type,
    html_content: formData.html_content,
    css_content: formData.css_content,
    js_content: formData.js_content,
    visibility_mode: formData.visibility_mode,
    visibility_pages: formData.visibility_pages || [],
    status: formData.status,
    priority: formData.priority || 0,
    updated_at: new Date().toISOString(),
    ...buildPopupData(formData),
  }

  const { data, error } = await supabase
    .from('models')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas/modelos')
  revalidatePath('/')
  return data as ModelRecord
}

export async function deleteModel(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('models').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas/modelos')
  revalidatePath('/')
  return { success: true }
}

export async function bulkUpdateModelsStatus(ids: string[], status: 'active' | 'inactive') {
  if (!ids.length) return { success: true, count: 0 }

  const supabase = await createServerClient()
  const targetStatus: ModelStatus = status === 'active' ? 'ativo' : 'inativo'

  const { error } = await supabase
    .from('models')
    .update({
      status: targetStatus,
      updated_at: new Date().toISOString(),
    })
    .in('id', ids)

  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas')
  revalidatePath('/painel/paginas/modelos')
  revalidatePath('/')
  return { success: true, count: ids.length }
}

export async function bulkDeleteModels(ids: string[]) {
  if (!ids.length) return { success: true, count: 0 }

  const supabase = await createServerClient()
  const { error } = await supabase.from('models').delete().in('id', ids)
  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas')
  revalidatePath('/painel/paginas/modelos')
  revalidatePath('/')
  return { success: true, count: ids.length }
}

export async function duplicateModel(id: string) {
  const supabase = await createServerClient()
  const profileId = await getAuthenticatedProfileId()

  const { data: original, error: fetchError } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) throw new Error('Modelo não encontrado.')

  const model = original as ModelRecord

  const { data, error } = await supabase
    .from('models')
    .insert({
      name: `${model.name} (cópia)`,
      description: model.description || '',
      model_type: model.model_type,
      html_content: model.html_content,
      css_content: model.css_content,
      js_content: model.js_content,
      visibility_mode: model.visibility_mode,
      visibility_pages: model.visibility_pages || [],
      popup_trigger: model.popup_trigger,
      popup_delay_seconds: model.popup_delay_seconds,
      popup_scroll_percent: model.popup_scroll_percent,
      popup_show_frequency: model.popup_show_frequency,
      popup_close_on_overlay: model.popup_close_on_overlay,
      popup_mobile_enabled: model.popup_mobile_enabled,
      status: 'inativo',
      priority: model.priority,
      created_by: profileId,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/painel/paginas/modelos')
  return data as ModelRecord
}

export async function getModelsStats() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('models').select('id, status, model_type')

  if (!data) {
    return { total: 0, ativos: 0, inativos: 0, headers: 0, footers: 0, popups: 0, cards: 0 }
  }

  return {
    total: data.length,
    ativos: data.filter((model) => model.status === 'ativo').length,
    inativos: data.filter((model) => model.status === 'inativo').length,
    headers: data.filter((model) => model.model_type === 'header').length,
    footers: data.filter((model) => model.model_type === 'footer').length,
    popups: data.filter((model) => model.model_type === 'popup').length,
    cards: data.filter((model) => model.model_type === 'card').length,
  }
}
