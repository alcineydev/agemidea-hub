'use client'

import { useState } from 'react'

interface Props {
  label: string
  value: string
}

export default function CopyField({ label, value }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-lg overflow-hidden flex-1 min-w-[200px]">
      <span className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase bg-[rgba(30,58,95,.15)] border-r border-[rgba(30,58,95,.35)] whitespace-nowrap">
        {label}
      </span>
      <span className="flex-1 px-2.5 py-1.5 text-xs text-slate-400 font-mono truncate">{value || '—'}</span>
      <button
        onClick={handleCopy}
        disabled={!value}
        className={`px-2.5 py-1.5 border-l border-[rgba(30,58,95,.35)] transition-all ${
          copied ? 'text-emerald-400' : 'text-slate-500 hover:text-cyan-400 hover:bg-[rgba(14,165,233,.05)]'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title={`Copiar ${label}`}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}
