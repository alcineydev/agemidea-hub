'use client'

import { useEffect, useState } from 'react'

import { toMediaUrl } from '@/lib/media-url'
import { createClient } from '@/lib/supabase/client'

export function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadFavicon = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'favicon_url')
        .single()

      if (data?.value) {
        setFaviconUrl(data.value)
      }
    }

    void loadFavicon()
  }, [])

  useEffect(() => {
    if (!faviconUrl) return

    const url = toMediaUrl(faviconUrl)
    const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
    existingLinks.forEach((link) => link.remove())

    const icon = document.createElement('link')
    icon.rel = 'icon'
    icon.type = faviconUrl.includes('.svg') ? 'image/svg+xml' : 'image/png'
    icon.href = url
    document.head.appendChild(icon)

    const apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    apple.href = url
    document.head.appendChild(apple)
  }, [faviconUrl])

  return null
}
