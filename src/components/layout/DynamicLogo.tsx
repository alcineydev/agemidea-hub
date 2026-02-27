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
  showIconFallback?: boolean
}

export function DynamicLogo({
  className = '',
  imgClassName = '',
  fallbackText = 'AGEMIDEA',
  fallbackBadge = 'HUB',
  showBadge = true,
  showIconFallback = false,
}: DynamicLogoProps) {
  const [logoMode, setLogoMode] = useState('text')
  const [logoUrl, setLogoUrl] = useState('')
  const [textConfig, setTextConfig] = useState({
    text: fallbackText,
    font: 'Inter',
    size: '24',
    color: '#0ea5e9',
    weight: '800',
    spacing: '-0.02em',
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'logo_type',
          'logo_image_url',
          'logo_text',
          'logo_font',
          'logo_size',
          'logo_color',
          'logo_weight',
          'logo_spacing',
        ])

      if (!data) return

      const settings: Record<string, string> = {}
      data.forEach((setting) => {
        settings[setting.key] = setting.value ?? ''
      })

      if (settings.logo_type) setLogoMode(settings.logo_type)
      if (settings.logo_image_url) setLogoUrl(settings.logo_image_url)
      setTextConfig((prev) => ({
        ...prev,
        text: settings.logo_text || prev.text,
        font: settings.logo_font || prev.font,
        size: settings.logo_size || prev.size,
        color: settings.logo_color || prev.color,
        weight: settings.logo_weight || prev.weight,
        spacing: settings.logo_spacing || prev.spacing,
      }))
    }

    void load()
  }, [fallbackText])

  if (logoMode === 'image' && logoUrl) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toMediaUrl(logoUrl)}
          alt={fallbackText}
          className={imgClassName || 'h-8 w-auto object-contain'}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIconFallback && (
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-[12px] font-bold">
          A
        </div>
      )}
      <span
        style={{
          fontFamily: textConfig.font,
          fontSize: `${textConfig.size}px`,
          fontWeight: Number(textConfig.weight),
          color: textConfig.color,
          letterSpacing: textConfig.spacing,
          lineHeight: 1,
        }}
      >
        {textConfig.text || fallbackText}
      </span>
      {showBadge && fallbackBadge && (
        <span className="text-[9px] px-1.5 py-0.5 bg-[rgba(14,165,233,0.15)] text-[#0ea5e9] rounded font-bold tracking-wider uppercase">
          {fallbackBadge}
        </span>
      )}
    </div>
  )
}
