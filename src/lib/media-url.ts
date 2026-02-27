/**
 * Converte URL pública do Supabase Storage em URL no domínio do site.
 *
 * Input:  https://xxx.supabase.co/storage/v1/object/public/site-assets/media/foto.jpg
 * Output: /media/media/foto.jpg
 *
 * Se a URL não for do Supabase, retorna como está.
 */
export function toMediaUrl(supabaseUrl: string): string {
  if (!supabaseUrl) return ''

  const marker = '/storage/v1/object/public/site-assets/'
  const idx = supabaseUrl.indexOf(marker)

  if (idx === -1) return supabaseUrl

  const path = supabaseUrl.substring(idx + marker.length)
  return `/media/${path}`
}

/**
 * Gera URL absoluta no domínio do site.
 * Útil para og:image e meta tags que precisam de URL completa.
 */
export function toAbsoluteMediaUrl(supabaseUrl: string): string {
  const relative = toMediaUrl(supabaseUrl)
  if (relative.startsWith('http')) return relative

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://agemidea.com.br')
  return `${baseUrl}${relative}`
}
