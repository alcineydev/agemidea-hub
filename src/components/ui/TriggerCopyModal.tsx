'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface TriggerCopyModalProps {
  open: boolean
  onClose: () => void
  modelId: string
  modelName: string
}

export default function TriggerCopyModal({ open, onClose, modelId, modelName }: TriggerCopyModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  if (!open) return null

  const snippets = [
    {
      label: 'Botão HTML',
      code: `<button onclick="agOpenPopup('${modelId}')">Solicitar Orçamento</button>`,
    },
    {
      label: 'Link',
      code: `<a href="#" onclick="agOpenPopup('${modelId}');return false">Abrir Popup</a>`,
    },
    {
      label: 'JavaScript',
      code: `agOpenPopup('${modelId}')`,
    },
    {
      label: 'Classe CSS (auto-bind)',
      code: `class="ag-trigger-popup" data-popup-id="${modelId}"`,
    },
  ]

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('Copiado!')
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="w-[560px] max-w-full bg-[#0c1020] border border-[#1e3a5f]/30 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)] space-y-3">
        <h3 className="text-white text-[16px] font-semibold">Triggers de {modelName}</h3>
        {snippets.map((snippet, index) => (
          <div key={snippet.label} className="rounded-lg border border-[#1e3a5f]/30 bg-[#050510] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{snippet.label}</span>
              <button
                onClick={() => copyToClipboard(snippet.code, index)}
                className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f]/30 text-slate-400 hover:text-cyan-400 hover:bg-[#1e3a5f]/20"
              >
                {copiedIndex === index ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <code className="text-[12px] text-slate-300 font-mono break-all">{snippet.code}</code>
          </div>
        ))}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-[#1e3a5f]/30 text-slate-400 hover:text-slate-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
