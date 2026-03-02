'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { ClientInsert } from '@/types/quotes'
import type { ClientAdminListItem } from '../_actions'
import {
  createAdminClientRecord,
  deleteAdminClientRecord,
  disableClientPanel,
  enableClientPanel,
  resetClientPanelPassword,
  updateAdminClientRecord,
} from '../_actions'

interface ClienteEditorProps {
  mode: 'create' | 'edit'
  initialClient?: ClientAdminListItem | null
}

function toErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const parts = Object.values(error as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
    return parts.join(' | ')
  }
  return null
}

const blankForm: ClientInsert = {
  name: '',
  trade_name: '',
  document_type: 'cnpj',
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

export default function ClienteEditor({ mode, initialClient = null }: ClienteEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createPanelNow, setCreatePanelNow] = useState(false)
  const [panelPassword, setPanelPassword] = useState('')
  const [newPanelPassword, setNewPanelPassword] = useState('')
  const [panelEnabled, setPanelEnabled] = useState(Boolean(initialClient?.panel_enabled))

  const [form, setForm] = useState<ClientInsert>(() => {
    if (!initialClient) return blankForm
    return {
      name: initialClient.name,
      trade_name: initialClient.trade_name ?? '',
      document_type: initialClient.document_type,
      document: initialClient.document ?? '',
      email: initialClient.email ?? '',
      phone: initialClient.phone ?? '',
      whatsapp: initialClient.whatsapp ?? '',
      address_street: initialClient.address_street ?? '',
      address_number: initialClient.address_number ?? '',
      address_complement: initialClient.address_complement ?? '',
      address_neighborhood: initialClient.address_neighborhood ?? '',
      address_city: initialClient.address_city ?? '',
      address_state: initialClient.address_state ?? '',
      address_zip: initialClient.address_zip ?? '',
      notes: initialClient.notes ?? '',
      created_by: initialClient.created_by ?? null,
    }
  })

  const title = useMemo(
    () => (mode === 'create' ? 'Novo Cliente' : `Editar Cliente - ${initialClient?.name ?? ''}`),
    [initialClient?.name, mode]
  )

  const setField = <K extends keyof ClientInsert>(key: K, value: ClientInsert[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    startTransition(async () => {
      if (mode === 'create') {
        const created = await createAdminClientRecord(form)
        if (created.error || !created.data) {
          toast.error(toErrorMessage(created.error) ?? 'Erro ao criar cliente.')
          return
        }

        if (createPanelNow) {
          const enableRes = await enableClientPanel(created.data.id, panelPassword)
          if (enableRes.error) {
            toast.error(enableRes.error)
          } else {
            toast.success('Cliente criado e painel liberado.')
          }
        } else {
          toast.success('Cliente criado com tag Orcamento.')
        }

        router.push(`/painel/clientes/${created.data.id}`)
        router.refresh()
        return
      }

      if (!initialClient?.id) return
      const updated = await updateAdminClientRecord(initialClient.id, form)
      if (updated.error) {
        toast.error(toErrorMessage(updated.error) ?? 'Erro ao atualizar cliente.')
        return
      }

      toast.success('Cliente atualizado.')
      router.refresh()
    })
  }

  const enablePanel = () => {
    if (!initialClient?.id) return
    startTransition(async () => {
      const result = await enableClientPanel(initialClient.id, panelPassword)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setPanelEnabled(true)
      setPanelPassword('')
      toast.success('Painel liberado para o cliente.')
      router.refresh()
    })
  }

  const removePanel = () => {
    if (!initialClient?.id) return
    if (!window.confirm('Deseja realmente excluir o painel deste cliente?')) return
    startTransition(async () => {
      const result = await disableClientPanel(initialClient.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setPanelEnabled(false)
      setNewPanelPassword('')
      toast.success('Painel removido.')
      router.refresh()
    })
  }

  const resetPassword = () => {
    if (!initialClient?.id) return
    startTransition(async () => {
      const result = await resetClientPanelPassword(initialClient.id, newPanelPassword)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setNewPanelPassword('')
      toast.success('Senha atualizada.')
    })
  }

  const removeClient = () => {
    if (!initialClient?.id) return
    if (!window.confirm('Excluir cliente definitivamente?')) return
    startTransition(async () => {
      const result = await deleteAdminClientRecord(initialClient.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Cliente excluido.')
      router.push('/painel/clientes')
    })
  }

  const inputClass =
    'w-full rounded-lg border border-[#1e3a5f]/30 bg-[#050510]/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/40'

  return (
    <div className="animate-fade-in space-y-4">
      <header className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/painel/clientes" className="text-xs font-semibold text-slate-400 hover:text-white">
            ← Voltar
          </Link>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={removeClient}
              className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400"
            >
              Excluir cliente
            </button>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-slate-500">
          {panelEnabled ? 'Tag atual: Painel' : 'Tag atual: Orcamento'}
        </p>
      </header>

      <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Dados do cliente</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-slate-500">Nome *</span>
            <input
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              className={inputClass}
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
            <span className="text-xs font-semibold text-slate-500">Tipo de documento</span>
            <select
              value={form.document_type}
              onChange={(event) => setField('document_type', event.target.value as 'cpf' | 'cnpj')}
              className={inputClass}
            >
              <option value="cnpj">CNPJ</option>
              <option value="cpf">CPF</option>
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
              onChange={(event) => setField('address_state', event.target.value)}
              maxLength={2}
              className={inputClass}
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-slate-500">Observacoes</span>
            <textarea
              value={form.notes ?? ''}
              onChange={(event) => setField('notes', event.target.value)}
              className={`${inputClass} min-h-24`}
            />
          </label>
        </div>
      </section>

      {mode === 'create' && (
        <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
          <label className="mb-2 inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={createPanelNow}
              onChange={(event) => setCreatePanelNow(event.target.checked)}
              className="h-4 w-4 rounded border border-[#1e3a5f]/30 bg-[#050510]/60"
            />
            Liberar painel agora
          </label>
          {createPanelNow && (
            <input
              type="password"
              value={panelPassword}
              onChange={(event) => setPanelPassword(event.target.value)}
              placeholder="Defina uma senha (min. 6)"
              className={inputClass}
            />
          )}
        </section>
      )}

      {mode === 'edit' && initialClient?.id && (
        <section className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Painel do cliente</h2>
          {!panelEnabled ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                Cliente esta como Orcamento. Ao liberar painel, a tag vira Painel.
              </p>
              <input
                type="password"
                value={panelPassword}
                onChange={(event) => setPanelPassword(event.target.value)}
                placeholder="Defina uma senha (min. 6)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={enablePanel}
                disabled={isPending}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Liberar painel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-emerald-300">Painel ativo para este cliente.</p>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="password"
                  value={newPanelPassword}
                  onChange={(event) => setNewPanelPassword(event.target.value)}
                  placeholder="Nova senha"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={isPending}
                  className="rounded-lg border border-cyan-500/30 px-4 py-2 text-sm font-semibold text-cyan-300"
                >
                  Redefinir senha
                </button>
              </div>
              <button
                type="button"
                onClick={removePanel}
                disabled={isPending}
                className="rounded-lg border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 disabled:opacity-60"
              >
                Excluir painel
              </button>
            </div>
          )}
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? 'Salvando...' : 'Salvar cliente'}
        </button>
      </div>
    </div>
  )
}
