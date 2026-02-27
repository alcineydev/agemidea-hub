'use server'

import { revalidatePath } from 'next/cache'

import { createAdminClient, createServerClient } from '@/lib/supabase/server'

export async function getSettings() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from('site_settings').select('key, value, type')

  if (error) throw error

  const map: Record<string, string> = {}
  data?.forEach((row) => {
    map[row.key] = row.value ?? ''
  })

  return map
}

export async function saveSettings(settings: Record<string, string>) {
  const supabase = await createServerClient()

  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))

  for (const update of updates) {
    const { error } = await supabase
      .from('site_settings')
      .update({ value: update.value, updated_at: update.updated_at })
      .eq('key', update.key)

    if (error) throw error
  }

  revalidatePath('/painel/configuracoes')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function saveSetting(key: string, value: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        key,
        value,
        type: 'text',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )

  if (error) {
    console.error(`Erro ao salvar setting ${key}:`, error)
    return { error: error.message }
  }

  revalidatePath('/painel/configuracoes')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function uploadSiteImage(formData: FormData) {
  const supabase = createAdminClient()
  const file = formData.get('file') as File
  const folder = String(formData.get('folder') ?? '')

  if (!file) throw new Error('Nenhum arquivo enviado.')
  if (!folder) throw new Error('Pasta de upload inválida.')

  const ext = file.name.split('.').pop() ?? 'png'
  const fileName = `${folder}/${folder}-${Date.now()}.${ext}`

  const { data: existing } = await supabase.storage.from('site-assets').list(folder)
  if (existing?.length) {
    const toRemove = existing.map((item) => `${folder}/${item.name}`)
    await supabase.storage.from('site-assets').remove(toRemove)
  }

  const { data, error } = await supabase.storage.from('site-assets').upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (error) throw error

  const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(fileName)
  const publicUrl = resolvePublicUrl(urlData.publicUrl, fileName)

  return {
    url: publicUrl,
    id: data.id ?? fileName,
    path: fileName,
  }
}

export async function removeSiteImage(folder: string) {
  const supabase = await createServerClient()
  const { data: existing } = await supabase.storage.from('site-assets').list(folder)

  if (existing?.length) {
    const toRemove = existing.map((item) => `${folder}/${item.name}`)
    await supabase.storage.from('site-assets').remove(toRemove)
  }

  return { success: true }
}

function resolvePublicUrl(rawUrl: string | undefined, filePath: string): string {
  if (rawUrl && rawUrl.startsWith('https://')) {
    return rawUrl
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return rawUrl ?? ''

  return `${baseUrl}/storage/v1/object/public/site-assets/${filePath}`
}
