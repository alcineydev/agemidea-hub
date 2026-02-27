'use client'

import { useEffect, useState } from 'react'

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  items: Array<{ id: string; name: string }>
}

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export default function DeleteConfirmModal({ open, onClose, onConfirm, items }: DeleteConfirmModalProps) {
  const [code, setCode] = useState(generateCode)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!open) return
    setCode(generateCode())
    setInput('')
  }, [open])

  if (!open) return null
  const isValid = input === code

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="w-[420px] max-w-full bg-[#0c1020] border border-[#1e3a5f]/30 rounded-2xl p-7 shadow-[0_20px_60px_rgba(0,0,0,.5)]">
        <div className="w-12 h-12 rounded-[14px] bg-red-500/8 border border-red-500/15 flex items-center justify-center mb-4">
          <svg className="w-[22px] h-[22px] text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 className="text-[17px] font-bold mb-1.5 text-white">Excluir permanentemente</h3>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
          Esta ação é <strong className="text-red-500">irreversível</strong>. Os itens abaixo serão excluídos permanentemente.
        </p>

        <div className="p-3 bg-red-500/[.04] border border-red-500/10 rounded-[10px] mb-5 max-h-[120px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5 py-0.5 text-[12px] text-slate-400">
              <svg className="w-3 h-3 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              {item.name}
            </div>
          ))}
        </div>

        <p className="text-[12px] text-slate-500 mb-2 flex items-center gap-1.5">
          Digite o código para confirmar:
          <span className="font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold tracking-widest">{code}</span>
        </p>

        <input
          value={input}
          onChange={(event) => setInput(event.target.value.replace(/\D/g, '').slice(0, 4))}
          className={`w-full p-3 bg-[#0a0f1e]/60 border-[1.5px] rounded-[10px] text-white text-lg font-mono tracking-[.3em] text-center outline-none transition-colors mb-5 ${
            input.length === 4 && !isValid
              ? 'border-red-500'
              : 'border-[#1e3a5f]/30 focus:border-red-500/40'
          }`}
          placeholder="0000"
          maxLength={4}
          autoFocus
        />

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#1e3a5f]/25 rounded-[10px] text-slate-500 text-[13px] font-medium hover:text-slate-400"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (isValid) onConfirm()
            }}
            disabled={!isValid}
            className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all ${
              isValid
                ? 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
                : 'bg-red-500/15 text-slate-500 cursor-not-allowed'
            }`}
          >
            Excluir permanentemente
          </button>
        </div>
      </div>
    </div>
  )
}
