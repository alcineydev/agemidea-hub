import { formatCurrency } from '@/lib/utils'
import type { PaymentCondition, PaymentInstallment } from '@/types/quotes'

interface QuotePaymentSectionProps {
  conditions: PaymentCondition[]
  selectedConditionId: string | null
  total: number
  readOnly?: boolean
  onChange: (condition: PaymentCondition | null, installments: PaymentInstallment[]) => void
  currentInstallments: PaymentInstallment[]
}

export default function QuotePaymentSection({
  conditions,
  selectedConditionId,
  total,
  readOnly = false,
  onChange,
  currentInstallments,
}: QuotePaymentSectionProps) {
  const activeConditions = conditions.filter((item) => item.is_active)
  const selected = activeConditions.find((item) => item.id === selectedConditionId) ?? null
  const installments = selected?.installments ?? currentInstallments

  return (
    <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Condicoes de pagamento</h3>
      <select
        value={selectedConditionId ?? ''}
        onChange={(event) => {
          const condition = activeConditions.find((item) => item.id === event.target.value) ?? null
          onChange(condition, condition?.installments ?? [])
        }}
        disabled={readOnly}
        className="mb-3 w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40 disabled:opacity-60"
      >
        <option value="">Selecione...</option>
        {activeConditions.map((condition) => (
          <option key={condition.id} value={condition.id}>
            {condition.name}
          </option>
        ))}
      </select>

      <div className="space-y-2">
        {installments.length === 0 && (
          <p className="text-xs text-slate-500">Nenhuma parcela definida.</p>
        )}
        {installments.map((installment, index) => {
          const value = total * (installment.percent / 100)
          return (
            <div
              key={`${installment.label}-${index}`}
              className="rounded-lg border border-[#1e3a5f]/20 bg-[#050510]/40 p-2"
            >
              <p className="text-xs text-slate-500">{installment.label}</p>
              <p className="text-sm font-semibold text-cyan-300">
                {installment.percent}% - {formatCurrency(value)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
