'use client'

import { useState } from 'react'

interface BlogOgSectionProps {
  ogTitle: string
  ogDescription: string
  ogImageUrl: string
  onChange: (field: 'og_title' | 'og_description' | 'og_image_url', value: string) => void
}

export default function BlogOgSection({
  ogTitle,
  ogDescription,
  ogImageUrl,
  onChange,
}: BlogOgSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-xl border border-[#1e1e2a] bg-[#111118]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h3 className="text-sm font-semibold text-[#e4e4e7]">Open Graph</h3>
        <span className="text-xs text-[#71717a]">{open ? 'Ocultar' : 'Mostrar'}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-[#1e1e2a] p-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#71717a]">OG Title</label>
            <p className="text-[11px] text-[#52525b]">Se vazio, usa o Meta Title automaticamente.</p>
            <input
              value={ogTitle}
              onChange={(event) => onChange('og_title', event.target.value)}
              className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#71717a]">OG Description</label>
            <textarea
              value={ogDescription}
              onChange={(event) => onChange('og_description', event.target.value)}
              className="min-h-[90px] w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#71717a]">OG Image URL</label>
            <p className="text-[11px] text-[#52525b]">Recomendado: 1200x630px</p>
            <input
              value={ogImageUrl}
              onChange={(event) => onChange('og_image_url', event.target.value)}
              className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
              placeholder="https://..."
            />
          </div>
        </div>
      )}
    </section>
  )
}
