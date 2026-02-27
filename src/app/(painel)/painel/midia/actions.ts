'use server'

import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/server'
import type { MediaFile } from './types'

const MEDIA_BUCKET = 'site-assets'
const KNOWN_FOLDERS = ['favicon', 'logo', 'media', 'uploads']

interface StorageEntry {
  id?: string | null
  name: string
  created_at?: string
  updated_at?: string
  metadata?: {
    size?: number
    mimetype?: string
    width?: number
    height?: number
  } | null
}

export async function listMediaFiles() {
  const supabase = createAdminClient()
  const allFiles: MediaFile[] = []

  const appendFiles = (entries: StorageEntry[] | null, folder: string) => {
    if (!entries?.length) return

    for (const file of entries) {
      if (!isStorageFile(file)) continue

      const path = folder ? `${folder}/${file.name}` : file.name
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)

      allFiles.push({
        id: path,
        name: file.name,
        bucket: MEDIA_BUCKET,
        folder,
        size: file.metadata?.size ?? 0,
        type: file.metadata?.mimetype ?? getMimeFromExtension(file.name),
        created_at: file.created_at ?? '',
        updated_at: file.updated_at ?? '',
        public_url: resolvePublicUrl(data.publicUrl, path),
        path,
        metadata: file.metadata ?? undefined,
      })
    }
  }

  const { data: rootFiles, error: rootError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })

  if (rootError) {
    return { files: [], error: rootError.message }
  }

  appendFiles(rootFiles as StorageEntry[], '')

  for (const folder of KNOWN_FOLDERS) {
    const { data: subFiles } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(folder, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })

    appendFiles((subFiles ?? []) as StorageEntry[], folder)
  }

  const uniqueMap = new Map(allFiles.map((file) => [file.path, file]))
  const files = Array.from(uniqueMap.values()).sort((a, b) => b.created_at.localeCompare(a.created_at))

  return { files, error: null }
}

export async function uploadMediaFiles(formData: FormData) {
  const supabase = createAdminClient()
  const files = formData.getAll('files') as File[]
  const results: Array<{ name: string; error?: string; url?: string; path?: string }> = []

  for (const file of files) {
    if (!file) continue

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const path = `media/${Date.now()}-${safeName}`

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type || undefined,
    })

    if (error) {
      results.push({ name: file.name, error: error.message })
      continue
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
    results.push({
      name: file.name,
      path,
      url: resolvePublicUrl(data.publicUrl, path),
    })
  }

  revalidatePath('/painel/midia')
  return { results }
}

export async function deleteMediaFiles(paths: string[]) {
  const supabase = createAdminClient()

  if (!paths.length) return { success: true }

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths)

  if (error) return { error: error.message }

  revalidatePath('/painel/midia')
  return { success: true }
}

function isStorageFile(file: StorageEntry) {
  if (!file?.name) return false
  if (file.name === '.emptyFolderPlaceholder') return false
  if (!file.metadata) return false
  return true
}

function getMimeFromExtension(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  }
  return map[ext || ''] || 'application/octet-stream'
}

function resolvePublicUrl(rawUrl: string | undefined, filePath: string): string {
  if (rawUrl && rawUrl.startsWith('https://')) return rawUrl

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return rawUrl ?? ''

  return `${baseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${filePath}`
}
