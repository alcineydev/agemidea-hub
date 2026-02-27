'use client'

import { useState } from 'react'

interface Props {
  values: Record<string, string>
  onUpdate: (key: string, value: string) => void
}

const inputClass =
  'w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-slate-200 text-sm px-3.5 py-2.5 focus:border-[#0ea5e9] outline-none'

const socials = [
  { key: 'social_facebook', label: 'Facebook' },
  { key: 'social_instagram', label: 'Instagram' },
  { key: 'social_linkedin', label: 'LinkedIn' },
  { key: 'social_twitter', label: 'Twitter/X' },
  { key: 'social_youtube', label: 'YouTube' },
]

export default function SocialLinks({ values, onUpdate }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {socials.map((social) => (
        <div key={social.key} className="group space-y-1">
          <FieldLabel label={social.label} settingKey={social.key} />
          <label className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg border border-[#1e3a5f] bg-[#1a2236] flex items-center justify-center text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </span>
            <input
              placeholder={`URL do ${social.label}`}
              value={values[social.key] || ''}
              onChange={(event) => onUpdate(social.key, event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      ))}
    </div>
  )
}

function FieldLabel({ label, settingKey }: { label: string; settingKey: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`{{${settingKey}}}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">{label}</span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#64748b] hover:text-[#0ea5e9]"
        title={`Copiar: {{${settingKey}}}`}
      >
        {copied ? (
          <svg className="w-3 h-3 text-[#10b981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}
