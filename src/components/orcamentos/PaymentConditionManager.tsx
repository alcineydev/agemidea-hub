'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  createPaymentCondition,
  deletePaymentCondition,
  updatePaymentCondition,
} from '@/app/(painel)/painel/orcamentos/_actions'
import type { PaymentCondition, PaymentInstallment } from '@/types/quotes'

interface PaymentConditionManagerProps {
  initialConditions: PaymentCondition[]
}

interface EditorState {
  id: string | null
  name: string
  description: string
  discount_percent: number
  is_active: boolean
  sort_order: number
  installments: PaymentInstallment[]
}

const emptyState: EditorState = {
  id: null,
  name: '',
  description: '',
  discount_percent: 0,
  is_active: true,
  sort_order: 0,
  installments: [{ label: 'Parcela unica', percent: 100 }],
}

function installmentsTotal(installments: PaymentInstallment[]) {
  return installments.reduce((sum, item) => sum + Number(item.percent || 0), 0)
}

export default function PaymentConditionManager({ initialConditions }: PaymentConditionManagerProps) {
  const [conditions, setConditions] = useState(initialConditions)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [isPending, startTransition] = useTransition()

  const sortedConditions = useMemo(
    () => [...conditions].sort((a, b) => a.sort_order - b.sort_order),
    [conditions]
  )

  const openNew = () => setEditor({ ...emptyState })
  const openEdit = (item: PaymentCondition) => {
    setEditor({
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      discount_percent: Number(item.discount_percent ?? 0),
      is_active: item.is_active,
      sort_order: item.sort_order,
      installments: item.installments.length ? item.installments : [{ label: 'Parcela unica', percent: 100 }],
    })
  }

  const saveEditor = () => {
    if (!editor) return
    const total = installmentsTotal(editor.installments)
    if (Math.abs(total - 100) > 0.001) {
      toast.error('As parcelas devem somar 100%.')
      return
    }

    startTransition(async () => {
      const payload = {
        name: editor.name,
        description: editor.description,
        discount_percent: editor.discount_percent,
        is_active: editor.is_active,
        sort_order: editor.sort_order,
        installments: editor.installments,
      }

      const result = editor.id
        ? await updatePaymentCondition(editor.id, payload)
        : await createPaymentCondition(payload)

      if (result.error) {
        toast.error(
          typeof result.error === 'string'
            ? result.error
            : Object.values(result.error).flat().join(' | ')
        )
        return
      }

      if (result.data) {
        setConditions((prev) => {
          if (editor.id) {
            return prev.map((item) => (item.id === editor.id ? result.data! : item))
          }
          return [...prev, result.data]
        })
      }
      setEditor(null)
      toast.success('Condicao salva.')
    })
  }

  const removeCondition = (id: string) => {
    const confirmed = window.confirm('Excluir esta condicao de pagamento?')
    if (!confirmed) return
    startTransition(async () => {
      const result = await deletePaymentCondition(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setConditions((prev) => prev.filter((item) => item.id !== id))
      toast.success('Condicao removida.')
    })
  }

  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40'

  return (
    <div className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Condicoes de pagamento</h3>
        <button
          type="button"
          onClick={openNew}
          className="rounded-md border border-cyan-500/30 px-2 py-1 text-xs font-semibold text-cyan-300"
        >
          Adicionar
        </button>
      </div>

      <div className="space-y-2">
        {sortedConditions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-[#1e3a5f]/20 bg-[#050510]/40 px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold text-slate-200">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.installments.length} parcela(s) - desconto {Number(item.discount_percent)}%
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="rounded-md border border-[#1e3a5f]/30 px-2 py-1 text-xs text-slate-300"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => removeCondition(item.id)}
                className="rounded-md border border-red-500/20 px-2 py-1 text-xs text-red-400"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {editor && (
        <div className="mt-4 rounded-xl border border-[#1e3a5f]/25 bg-[#050510]/40 p-3">
          <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Nome</span>
              <input
                value={editor.name}
                onChange={(event) => setEditor((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                className={inputClass}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Desconto %</span>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={editor.discount_percent}
                onChange={(event) =>
                  setEditor((prev) =>
                    prev ? { ...prev, discount_percent: Number(event.target.value) || 0 } : prev
                  )
                }
                className={inputClass}
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold text-slate-500">Descricao</span>
              <textarea
                value={editor.description}
                onChange={(event) =>
                  setEditor((prev) => (prev ? { ...prev, description: event.target.value } : prev))
                }
                className={`${inputClass} min-h-20`}
              />
            </label>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parcelas</p>
            <button
              type="button"
              onClick={() =>
                setEditor((prev) =>
                  prev
                    ? {
                        ...prev,
                        installments: [...prev.installments, { label: '', percent: 0 }],
                      }
                    : prev
                )
              }
              className="rounded-md border border-[#1e3a5f]/30 px-2 py-1 text-xs text-slate-300"
            >
              Adicionar parcela
            </button>
          </div>

          <div className="space-y-2">
            {editor.installments.map((installment, index) => (
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_120px_auto] gap-2">
                <input
                  value={installment.label}
                  onChange={(event) =>
                    setEditor((prev) =>
                      prev
                        ? {
                            ...prev,
                            installments: prev.installments.map((item, i) =>
                              i === index ? { ...item, label: event.target.value } : item
                            ),
                          }
                        : prev
                    )
                  }
                  placeholder="Descricao da parcela"
                  className={inputClass}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={installment.percent}
                  onChange={(event) =>
                    setEditor((prev) =>
                      prev
                        ? {
                            ...prev,
                            installments: prev.installments.map((item, i) =>
                              i === index ? { ...item, percent: Number(event.target.value) || 0 } : item
                            ),
                          }
                        : prev
                    )
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditor((prev) =>
                      prev
                        ? {
                            ...prev,
                            installments: prev.installments.filter((_, i) => i !== index),
                          }
                        : prev
                    )
                  }
                  className="rounded-lg border border-red-500/20 px-3 text-xs font-semibold text-red-300"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Soma atual: <strong className="text-cyan-300">{installmentsTotal(editor.installments)}%</strong>
          </p>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditor(null)}
              className="rounded-lg border border-[#1e3a5f]/30 px-3 py-2 text-xs font-semibold text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={saveEditor}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Salvar condicao
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
