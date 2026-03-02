'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { publicUpdateQuoteStatus } from '@/app/(painel)/painel/orcamentos/_actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Quote, QuoteSettings } from '@/types/quotes'
import QuoteStatusBadge from '@/components/orcamentos/QuoteStatusBadge'

interface PublicQuoteClientProps {
  token: string
  quote: Quote
  settings: QuoteSettings | null
}

function isExpired(validUntil: string | null) {
  if (!validUntil) return false
  const today = new Date(new Date().toISOString().split('T')[0])
  return new Date(validUntil) < today
}

export default function PublicQuoteClient({ token, quote, settings }: PublicQuoteClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const expired = useMemo(() => isExpired(quote.valid_until), [quote.valid_until])

  const primaryColor = settings?.primary_color || '#0ea5e9'
  const headerBg = `${primaryColor}22`
  const canRespond = quote.status === 'sent' && !expired

  const respond = (action: 'approve' | 'reject') => {
    startTransition(async () => {
      const result = await publicUpdateQuoteStatus(token, action, rejectionReason)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(action === 'approve' ? 'Orcamento aprovado.' : 'Orcamento recusado.')
      router.refresh()
    })
  }

  return (
    <main className="min-h-screen bg-[#050510] px-4 py-6 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <header className="rounded-2xl border border-[#1e3a5f]/25 p-5" style={{ background: headerBg }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {settings?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_url} alt="Logo" className="h-10 w-auto" />
              ) : (
                <div className="rounded bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-300">LOGO</div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Orcamento</p>
                <h1 className="text-xl font-bold">{quote.quote_number}</h1>
              </div>
            </div>
            <QuoteStatusBadge status={quote.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
            <p>
              <strong className="text-slate-100">Validade:</strong>{' '}
              {quote.valid_until ? formatDate(quote.valid_until) : 'Sem prazo'}
            </p>
            {expired && (
              <p className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">
                Este orcamento expirou em {quote.valid_until ? formatDate(quote.valid_until) : '-'}
              </p>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e] p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">De</p>
            <p className="text-base font-semibold">{settings?.company_name || 'Sua empresa'}</p>
            <p className="text-sm text-slate-400">{settings?.company_email || '-'}</p>
            <p className="text-sm text-slate-400">{settings?.company_phone || '-'}</p>
          </article>
          <article className="rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e] p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Para</p>
            <p className="text-base font-semibold">{quote.client?.name || '-'}</p>
            <p className="text-sm text-slate-400">{quote.client?.email || '-'}</p>
            <p className="text-sm text-slate-400">{quote.client?.phone || '-'}</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[#050510]/40">
                <tr>
                  {['#', 'Servico', 'Descricao', 'Qtd', 'Valor', 'Desc.', 'Subtotal'].map((head) => (
                    <th
                      key={head}
                      className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quote.items?.map((item, index) => (
                  <tr key={item.id} className="border-t border-[#1e3a5f]/10">
                    <td className="px-3 py-2 text-sm text-slate-400">{index + 1}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-slate-200">{item.service_name}</td>
                    <td className="px-3 py-2 text-sm text-slate-400">{item.description || '-'}</td>
                    <td className="px-3 py-2 text-sm text-slate-300">{item.quantity}</td>
                    <td className="px-3 py-2 text-sm text-slate-300">
                      {formatCurrency(Number(item.unit_price))}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-300">{item.discount_percent}%</td>
                    <td className="px-3 py-2 text-sm font-semibold text-cyan-300">
                      {formatCurrency(Number(item.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
          <article className="space-y-4 rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e] p-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Observacoes</h2>
              <p className="text-sm text-slate-400">{quote.observation || 'Sem observacoes adicionais.'}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Condicoes de pagamento</h2>
              <div className="mt-2 space-y-2">
                {(quote.payment_installments || []).map((installment, index) => (
                  <div
                    key={`${installment.label}-${index}`}
                    className="rounded-lg border border-[#1e3a5f]/20 bg-[#050510]/40 px-3 py-2"
                  >
                    <p className="text-xs text-slate-500">{installment.label}</p>
                    <p className="text-sm font-semibold text-cyan-300">
                      {installment.percent}% - {formatCurrency((Number(quote.total) * installment.percent) / 100)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="space-y-3 rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e] p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Subtotal</p>
            <p className="text-sm text-slate-300">{formatCurrency(Number(quote.subtotal))}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">Descontos</p>
            <p className="text-sm text-amber-300">- {formatCurrency(Number(quote.discount_total))}</p>
            <div className="border-t border-[#1e3a5f]/20 pt-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-2xl font-bold text-cyan-300">{formatCurrency(Number(quote.total))}</p>
            </div>
          </aside>
        </section>

        <section className="rounded-xl border border-[#1e3a5f]/20 bg-[#0a0f1e] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/quotes/${quote.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#1e3a5f]/30 px-3 py-2 text-sm font-semibold text-slate-300"
            >
              Baixar PDF
            </a>

            {canRespond && (
              <>
                <button
                  type="button"
                  onClick={() => respond('approve')}
                  disabled={isPending}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300 disabled:opacity-60"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  onClick={() => setRejectMode((prev) => !prev)}
                  disabled={isPending}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 disabled:opacity-60"
                >
                  Recusar
                </button>
              </>
            )}

            {quote.status === 'approved' && quote.approved_at && (
              <p className="rounded bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                Aprovado em {formatDate(quote.approved_at)}
              </p>
            )}

            {quote.status === 'rejected' && (
              <p className="rounded bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">
                Recusado{quote.rejected_at ? ` em ${formatDate(quote.rejected_at)}` : ''}
                {quote.rejection_reason ? ` - ${quote.rejection_reason}` : ''}
              </p>
            )}
          </div>

          {rejectMode && canRespond && (
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <input
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Motivo (opcional)"
                className="flex-1 rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40"
              />
              <button
                type="button"
                onClick={() => respond('reject')}
                disabled={isPending}
                className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-300 disabled:opacity-60"
              >
                Confirmar recusa
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
