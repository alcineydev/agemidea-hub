'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  createQuote,
  deleteQuote,
  updateQuote,
  updateQuoteStatus,
} from '@/app/(painel)/painel/orcamentos/_actions'
import type {
  Client,
  PaymentCondition,
  Quote,
  QuoteFormInput,
  QuoteHistory,
  QuoteSettings,
  QuoteStatus,
} from '@/types/quotes'
import ClientFormModal from './ClientFormModal'
import ClientSearchSelect from './ClientSearchSelect'
import QuoteItemRow from './QuoteItemRow'
import QuotePaymentSection from './QuotePaymentSection'
import QuoteSendActions from './QuoteSendActions'
import QuoteStatusBadge from './QuoteStatusBadge'
import QuoteSummaryCard from './QuoteSummaryCard'

interface QuoteFormProps {
  mode: 'create' | 'edit'
  settings: QuoteSettings
  clients: Client[]
  paymentConditions: PaymentCondition[]
  initialQuote?: Quote | null
  history?: QuoteHistory[]
}

type EditableItem = QuoteFormInput['items'][number]

const emptyItem: EditableItem = {
  service_name: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  discount_percent: 0,
  sort_order: 0,
}

function extractActionError(error: unknown) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    return Object.values(error as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .join(' | ')
  }
  return null
}

export default function QuoteForm({
  mode,
  settings,
  clients,
  paymentConditions,
  initialQuote = null,
  history = [],
}: QuoteFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(initialQuote?.client ?? null)
  const [quoteId, setQuoteId] = useState<string | null>(initialQuote?.id ?? null)
  const [quoteNumber, setQuoteNumber] = useState<string | null>(initialQuote?.quote_number ?? null)
  const [publicToken, setPublicToken] = useState<string | null>(initialQuote?.public_token ?? null)
  const [status, setStatus] = useState<QuoteStatus>(initialQuote?.status ?? 'draft')

  const defaultValidity = useMemo(() => {
    const base = new Date()
    base.setDate(base.getDate() + (settings.default_validity_days ?? 15))
    return base.toISOString().split('T')[0]
  }, [settings.default_validity_days])

  const [title, setTitle] = useState(initialQuote?.title ?? '')
  const [validUntil, setValidUntil] = useState(initialQuote?.valid_until ?? defaultValidity)
  const [observation, setObservation] = useState(
    initialQuote?.observation ?? settings.default_observation ?? ''
  )
  const [terms, setTerms] = useState(initialQuote?.terms ?? settings.default_terms ?? '')
  const [paymentConditionId, setPaymentConditionId] = useState<string | null>(
    initialQuote?.payment_condition_id ?? null
  )
  const [paymentConditionName, setPaymentConditionName] = useState<string>(
    initialQuote?.payment_condition_name ?? ''
  )
  const [paymentInstallments, setPaymentInstallments] = useState(
    initialQuote?.payment_installments ?? []
  )
  const [items, setItems] = useState<EditableItem[]>(
    initialQuote?.items?.map((item, index) => ({
      service_name: item.service_name,
      description: item.description ?? '',
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      discount_percent: Number(item.discount_percent),
      sort_order: item.sort_order ?? index,
    })) ?? [{ ...emptyItem }]
  )

  const readOnly = status !== 'draft'

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0),
    [items]
  )
  const discount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity) *
            Number(item.unit_price) *
            (Number(item.discount_percent ?? 0) / 100),
        0
      ),
    [items]
  )
  const total = useMemo(() => subtotal - discount, [subtotal, discount])

  const buildPayload = (): QuoteFormInput | null => {
    if (!selectedClient?.id) {
      toast.error('Selecione um cliente.')
      return null
    }
    if (!items.length) {
      toast.error('Adicione ao menos um servico.')
      return null
    }

    return {
      title,
      client_id: selectedClient.id,
      payment_condition_id: paymentConditionId,
      payment_condition_name: paymentConditionName,
      payment_installments: paymentInstallments,
      observation,
      terms,
      valid_until: validUntil || null,
      items: items.map((item, index) => ({
        ...item,
        sort_order: index,
      })),
    }
  }

  const persistQuote = async () => {
    const payload = buildPayload()
    if (!payload) return null

    if (quoteId) {
      const result = await updateQuote(quoteId, payload)
      if (result.error) {
        toast.error(extractActionError(result.error) ?? 'Erro ao atualizar orcamento.')
        return null
      }
      toast.success('Orcamento atualizado.')
      return result.data ?? null
    }

    const result = await createQuote(payload)
    if (result.error) {
      toast.error(extractActionError(result.error) ?? 'Erro ao criar orcamento.')
      return null
    }

    if (!result.data) return null

    setQuoteId(result.data.id)
    setQuoteNumber(result.data.quote_number)
    setPublicToken(result.data.public_token)
    setStatus(result.data.status)
    toast.success('Orcamento criado.')
    router.replace(`/painel/orcamentos/${result.data.id}`)
    return result.data
  }

  const handleSave = () => {
    startTransition(() => {
      void persistQuote()
    })
  }

  const transitionStatus = (newStatus: QuoteStatus, reason?: string) => {
    if (!quoteId) return
    startTransition(async () => {
      const result = await updateQuoteStatus(quoteId, newStatus, {
        rejection_reason: reason,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      setStatus(newStatus)
      toast.success('Status atualizado.')
      router.refresh()
    })
  }

  const handleSend = () => {
    startTransition(async () => {
      let ensuredId = quoteId
      if (!ensuredId) {
        const created = await persistQuote()
        ensuredId = created?.id ?? null
      }
      if (!ensuredId) return

      const result = await updateQuoteStatus(ensuredId, 'sent')
      if (result.error) {
        toast.error(result.error)
        return
      }

      setStatus('sent')
      toast.success('Orcamento enviado.')
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!quoteId) return
    const confirmed = window.confirm('Excluir este rascunho? Esta acao nao pode ser desfeita.')
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteQuote(quoteId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Orcamento excluido.')
      router.push('/painel/orcamentos')
    })
  }

  const handleConditionChange = (
    condition: PaymentCondition | null,
    installments: Array<{ label: string; percent: number }>
  ) => {
    setPaymentConditionId(condition?.id ?? null)
    setPaymentConditionName(condition?.name ?? '')
    setPaymentInstallments(installments)
  }

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem, sort_order: prev.length }])
  }

  const updateItem = (index: number, patch: Partial<EditableItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="animate-fade-in space-y-4">
        <header className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Link href="/painel/orcamentos" className="text-xs font-semibold text-slate-400 hover:text-white">
              ← Voltar
            </Link>
            {quoteId && status === 'draft' && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400"
              >
                Excluir rascunho
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-white">
                {mode === 'create' ? 'Novo Orcamento' : 'Editar Orcamento'}
              </h1>
              <p className="text-sm text-slate-500">
                {quoteNumber ?? 'Sera gerado ao salvar'} {quoteNumber ? '·' : ''} {quoteNumber ? (
                  <span className="inline-block align-middle">
                    <QuoteStatusBadge status={status} compact />
                  </span>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending || readOnly}
                className="rounded-lg border border-[#1e3a5f]/30 px-3 py-2 text-sm font-semibold text-slate-300 disabled:opacity-50"
              >
                Salvar rascunho
              </button>
              {status === 'draft' && (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isPending}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Enviar ao cliente
                </button>
              )}
            </div>
          </div>

          {status !== 'draft' && (
            <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
              Este orcamento foi enviado. Volte para rascunho para editar.
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-4">
            <ClientSearchSelect
              selectedClient={selectedClient}
              initialClients={clients}
              readOnly={readOnly}
              onSelect={setSelectedClient}
              onClear={() => setSelectedClient(null)}
              onCreateNew={() => setShowClientModal(true)}
            />

            <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Servicos</h3>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-md border border-cyan-500/30 px-2 py-1 text-xs font-semibold text-cyan-300"
                  >
                    Adicionar servico
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <QuoteItemRow
                    key={`${index}-${item.service_name}`}
                    index={index}
                    item={item}
                    readOnly={readOnly}
                    onChange={(patch) => updateItem(index, patch)}
                    onRemove={() => removeItem(index)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Observacoes e termos</h3>
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Observacoes gerais</span>
                  <textarea
                    value={observation}
                    onChange={(event) => setObservation(event.target.value)}
                    className="min-h-24 w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40 disabled:opacity-60"
                    disabled={readOnly}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Termos e condicoes</span>
                  <textarea
                    value={terms}
                    onChange={(event) => setTerms(event.target.value)}
                    className="min-h-28 w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40 disabled:opacity-60"
                    disabled={readOnly}
                  />
                </label>
              </div>
            </section>

            {history.length > 0 && (
              <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">Historico</h3>
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-[#1e3a5f]/20 bg-[#050510]/40 px-3 py-2"
                    >
                      <p className="text-xs text-slate-400">
                        {new Date(entry.created_at).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-sm font-semibold text-slate-200">
                        {entry.from_status ? `${entry.from_status} -> ` : ''}
                        {entry.to_status}
                      </p>
                      {entry.notes && <p className="text-xs text-slate-500">{entry.notes}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </section>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Configuracoes</h3>
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Validade</span>
                  <input
                    type="date"
                    value={validUntil ?? ''}
                    onChange={(event) => setValidUntil(event.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40 disabled:opacity-60"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Referencia / titulo</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={readOnly}
                    className="w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40 disabled:opacity-60"
                    placeholder="Ex: Website institucional 2026"
                  />
                </label>
              </div>
            </section>

            <QuoteSummaryCard subtotal={subtotal} discount={discount} total={total} />

            <QuotePaymentSection
              conditions={paymentConditions}
              selectedConditionId={paymentConditionId}
              total={total}
              readOnly={readOnly}
              currentInstallments={paymentInstallments}
              onChange={handleConditionChange}
            />

            <QuoteSendActions
              quoteId={quoteId}
              publicToken={publicToken}
              disabled={status !== 'draft' || isPending}
              onSend={handleSend}
            />

            {status === 'sent' && (
              <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">Acoes de status</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => transitionStatus('approved')}
                    className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm font-semibold text-emerald-300"
                  >
                    Marcar como aprovado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = window.prompt('Motivo da recusa (opcional):') ?? ''
                      transitionStatus('rejected', reason)
                    }}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-300"
                  >
                    Marcar como recusado
                  </button>
                  <button
                    type="button"
                    onClick={() => transitionStatus('draft')}
                    className="rounded-lg border border-[#1e3a5f]/30 px-3 py-2 text-sm font-semibold text-slate-300"
                  >
                    Voltar para rascunho
                  </button>
                </div>
              </section>
            )}

            {status === 'rejected' && (
              <button
                type="button"
                onClick={() => transitionStatus('draft')}
                className="w-full rounded-lg border border-[#1e3a5f]/30 px-3 py-2 text-sm font-semibold text-slate-300"
              >
                Reabrir como rascunho
              </button>
            )}
          </aside>
        </div>
      </div>

      <ClientFormModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
        onCreated={(client) => setSelectedClient(client)}
      />
    </>
  )
}
