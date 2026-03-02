'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { createClient } from '@/app/(painel)/painel/orcamentos/_actions'
import type { Client, ClientInsert, DocumentType } from '@/types/quotes'

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  onCreated: (client: Client) => void
}

const initialForm: ClientInsert = {
  name: '',
  trade_name: '',
  document_type: 'cpf',
  document: '',
  email: '',
  phone: '',
  whatsapp: '',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  notes: '',
  created_by: null,
}

function maskCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export default function ClientFormModal({ open, onClose, onCreated }: ClientFormModalProps) {
  const [form, setForm] = useState<ClientInsert>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  const setField = <K extends keyof ClientInsert>(key: K, value: ClientInsert[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    setForm(initialForm)
    setSubmitting(false)
    onClose()
  }

  const handleCep = async (value: string) => {
    const cep = maskCep(value)
    setField('address_zip', cep)

    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return

    try {
      setCepLoading(true)
      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = (await response.json()) as {
        logradouro?: string
        bairro?: string
        localidade?: string
        uf?: string
        complemento?: string
        erro?: boolean
      }

      if (!data?.erro) {
        if (data.logradouro) setField('address_street', data.logradouro)
        if (data.bairro) setField('address_neighborhood', data.bairro)
        if (data.localidade) setField('address_city', data.localidade)
        if (data.uf) setField('address_state', data.uf)
        if (data.complemento && !form.address_complement) {
          setField('address_complement', data.complemento)
        }
      }
    } finally {
      setCepLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const result = await createClient(form)
    setSubmitting(false)

    if ('error' in result && result.error) {
      const errorMessage =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error).flat().filter(Boolean).join(' | ')
      toast.error(errorMessage || 'Erro ao criar cliente.')
      return
    }

    if (result.data) {
      toast.success('Cliente criado com sucesso.')
      onCreated(result.data)
      handleClose()
    }
  }

  if (!open) return null

  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#1e3a5f]/30 bg-[#0a0f1e] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Novo cliente</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-[#1e3a5f]/30 px-3 py-1.5 text-xs text-slate-400"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-slate-500">Nome *</span>
            <input
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              className={inputClass}
              placeholder="Nome do cliente"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Nome fantasia</span>
            <input
              value={form.trade_name ?? ''}
              onChange={(event) => setField('trade_name', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Tipo documento</span>
            <select
              value={form.document_type}
              onChange={(event) => setField('document_type', event.target.value as DocumentType)}
              className={inputClass}
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Documento</span>
            <input
              value={form.document ?? ''}
              onChange={(event) => setField('document', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Email</span>
            <input
              value={form.email ?? ''}
              onChange={(event) => setField('email', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Telefone</span>
            <input
              value={form.phone ?? ''}
              onChange={(event) => setField('phone', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">WhatsApp</span>
            <input
              value={form.whatsapp ?? ''}
              onChange={(event) => setField('whatsapp', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">CEP</span>
            <input
              value={form.address_zip ?? ''}
              onChange={(event) => {
                void handleCep(event.target.value)
              }}
              className={inputClass}
              placeholder="00000-000"
            />
            {cepLoading && <span className="text-[11px] text-cyan-300">Buscando endereco...</span>}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Rua</span>
            <input
              value={form.address_street ?? ''}
              onChange={(event) => setField('address_street', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Numero</span>
            <input
              value={form.address_number ?? ''}
              onChange={(event) => setField('address_number', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Complemento</span>
            <input
              value={form.address_complement ?? ''}
              onChange={(event) => setField('address_complement', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Bairro</span>
            <input
              value={form.address_neighborhood ?? ''}
              onChange={(event) => setField('address_neighborhood', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Cidade</span>
            <input
              value={form.address_city ?? ''}
              onChange={(event) => setField('address_city', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">UF</span>
            <input
              value={form.address_state ?? ''}
              maxLength={2}
              onChange={(event) => setField('address_state', event.target.value.toUpperCase())}
              className={inputClass}
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-slate-500">Observacoes</span>
            <textarea
              value={form.notes ?? ''}
              onChange={(event) => setField('notes', event.target.value)}
              className={`${inputClass} min-h-20 resize-y`}
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-[#1e3a5f]/30 px-4 py-2 text-sm font-semibold text-slate-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Salvando...' : 'Salvar cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}
