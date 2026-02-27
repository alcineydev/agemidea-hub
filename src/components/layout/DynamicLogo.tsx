'use client'

import { useEffect, useState } from 'react'

import { toMediaUrl } from '@/lib/media-url'
import { createClient } from '@/lib/supabase/client'

interface DynamicLogoProps {
  className?: string
  imgClassName?: string
  fallbackText?: string
  fallbackBadge?: string
  showBadge?: boolean
  showIcon?: boolean
}

export function DynamicLogo({
  className = '',
  imgClassName = 'h-8 w-auto object-contain',
  fallbackText = 'AGEMIDEA',
  fallbackBadge = 'HUB',
  showBadge = true,
  showIcon = true,
}: DynamicLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['logo_image_url', 'logo_type'])

        if (!data) return

        const settings: Record<string, string> = {}
        data.forEach((setting) => {
          settings[setting.key] = setting.value ?? ''
        })

        if (settings.logo_image_url && settings.logo_image_url.trim() !== '') {
          setLogoUrl(settings.logo_image_url)
        }
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {showIcon && <FallbackIcon />}
        <span className="text-base font-extrabold tracking-tight text-white">{fallbackText}</span>
        {showBadge && fallbackBadge && (
          <span className="text-[9px] px-1.5 py-0.5 bg-[rgba(14,165,233,0.15)] text-[#0ea5e9] rounded font-bold tracking-wider uppercase">
            {fallbackBadge}
          </span>
        )}
      </div>
    )
  }

  if (logoUrl) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toMediaUrl(logoUrl)}
          alt={fallbackText}
          className={imgClassName}
          onError={() => setLogoUrl(null)}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <FallbackIcon />}
      <span className="text-base font-extrabold tracking-tight text-white">{fallbackText}</span>
      {showBadge && fallbackBadge && (
        <span className="text-[9px] px-1.5 py-0.5 bg-[rgba(14,165,233,0.15)] text-[#0ea5e9] rounded font-bold tracking-wider uppercase">
          {fallbackBadge}
        </span>
      )}
    </div>
  )
}

function FallbackIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] flex items-center justify-center flex-shrink-0">
      <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    </div>
  )
}
