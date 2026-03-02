'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface QuoteSendActionsProps {
  quoteId?: string | null
  publicToken?: string | null
  disabled?: boolean
  onSend: () => void
  onGenerateLink: () => void
  onRevokeLink: () => void
}

export default function QuoteSendActions({
  quoteId,
  publicToken,
  disabled = false,
  onSend,
  onGenerateLink,
  onRevokeLink,
}: QuoteSendActionsProps) {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const publicUrl = publicToken && origin ? `${origin}/orcamento/${publicToken}` : ''

  const handleCopyLink = async () => {
    if (!publicUrl) {
      toast.error('Salve o orcamento para gerar o link publico.')
      return
    }
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Link copiado.')
    } catch {
      toast.error('Nao foi possivel copiar.')
    }
  }

  const whatsappHref = publicUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Segue seu orcamento: ${publicUrl}`)}`
    : '#'

  return (
    <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Enviar Orcamento</h3>
      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        className="mb-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        Enviar ao cliente
      </button>

      <div className="grid grid-cols-3 gap-2">
        <a
          href={quoteId ? `/api/quotes/${quoteId}/pdf` : '#'}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-[#1e3a5f]/30 px-2 py-2 text-center text-xs font-semibold text-slate-300"
        >
          PDF
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-[#1e3a5f]/30 px-2 py-2 text-center text-xs font-semibold text-slate-300"
        >
          WhatsApp
        </a>
        <button
          type="button"
          disabled={!publicToken}
          onClick={() => void handleCopyLink()}
          className="rounded-lg border border-[#1e3a5f]/30 px-2 py-2 text-center text-xs font-semibold text-slate-300 disabled:opacity-40"
        >
          Copiar link
        </button>
      </div>

      <div className="mt-2">
        {publicToken ? (
          <button
            type="button"
            onClick={onRevokeLink}
            className="w-full rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400"
          >
            Excluir link publico
          </button>
        ) : (
          <button
            type="button"
            onClick={onGenerateLink}
            className="w-full rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-300"
          >
            Gerar link publico
          </button>
        )}
      </div>
    </section>
  )
}
