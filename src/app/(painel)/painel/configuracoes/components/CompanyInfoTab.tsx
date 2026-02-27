'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { BusinessHours, SettingsMap } from '../types'
import { DEFAULT_BUSINESS_HOURS } from '../types'
import type { ValidationError } from '../utils/validation'
import { maskCEP, maskCNPJ, maskPhone } from '../utils/masks'
import BusinessHoursEditor from './BusinessHours'
import SocialLinks from './SocialLinks'

interface Props {
  settings: SettingsMap
  onUpdate: (key: string, value: string) => void
  errors?: ValidationError[]
}

const cardClass =
  'bg-[#111827] border border-[#1e3a5f] rounded-xl p-4 md:p-6'
const inputClass =
  'w-full bg-[#1a2236] border border-[#1e3a5f] rounded-lg text-slate-200 text-sm px-3.5 py-2.5 focus:border-[#0ea5e9] outline-none'
const textareaClass = `${inputClass} min-h-[84px] resize-y`
const labelClass = 'text-[11px] font-semibold text-[#64748b] uppercase tracking-wider'

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]

const KEY_MAP = {
  company_name: 'company_name',
  company_cnpj: 'company_cnpj',
  company_description: 'company_description',
  address_zip: 'address_zip',
  address_street: 'address_street',
  address_neighborhood: 'address_neighborhood',
  address_complement: 'address_complement',
  address_city: 'address_city',
  address_state: 'address_state',
  address_maps_url: 'address_maps_url',
  phone_whatsapp: 'phone_whatsapp',
  phone_landline: 'phone_landline',
  email_main: 'email_main',
  email_support: 'email_support',
  email_privacy: 'email_privacy',
  social_instagram: 'social_instagram',
  social_facebook: 'social_facebook',
  social_linkedin: 'social_linkedin',
  social_youtube: 'social_youtube',
  social_twitter: 'social_twitter',
} as const

function parseHours(hoursRaw: string | undefined): BusinessHours {
  if (!hoursRaw) return DEFAULT_BUSINESS_HOURS
  try {
    const parsed = JSON.parse(hoursRaw) as Partial<BusinessHours>
    return { ...DEFAULT_BUSINESS_HOURS, ...parsed }
  } catch {
    return DEFAULT_BUSINESS_HOURS
  }
}

export default function CompanyInfoTab({ settings, onUpdate, errors = [] }: Props) {
  const hoursValue = useMemo(() => parseHours(settings.hours), [settings.hours])
  const getError = (field: string) => errors.find((error) => error.field === field)
  const errorClass = (field: string) =>
    getError(field) ? 'border-red-500/50 focus:border-red-500' : ''
  const [cepLoading, setCepLoading] = useState(false)

  const handleCepChange = async (value: string) => {
    const masked = maskCEP(value)
    onUpdate('address_zip', masked)

    const cleanCep = masked.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setCepLoading(true)
    const address = await fetchAddressByCep(cleanCep)
    setCepLoading(false)

    if (!address) return

    if (address.street) onUpdate('address_street', address.street)
    if (address.neighborhood) onUpdate('address_neighborhood', address.neighborhood)
    if (address.city) onUpdate('address_city', address.city)
    if (address.state) onUpdate('address_state', address.state)
    if (address.complement && !(settings.address_complement || '').trim()) {
      onUpdate('address_complement', address.complement)
    }
    toast.success('Endereço preenchido pelo CEP.')
  }

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-white">Dados da Empresa</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(14,165,233,0.1)] text-[#0ea5e9] font-bold uppercase tracking-wider">
              SEO
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-1">
            Estas informações são usadas no SEO do site (meta tags, Open Graph, schema.org).
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="text-sm text-slate-300 space-y-2 group">
            <FieldLabel label="Nome da Empresa *" settingKey={KEY_MAP.company_name} />
            <input aria-label="Nome da Empresa" value={settings.company_name || ''} onChange={(e) => onUpdate('company_name', e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm text-slate-300 space-y-2 group">
            <FieldLabel label="CNPJ" settingKey={KEY_MAP.company_cnpj} />
            <div data-field="company_cnpj">
              <input
                value={settings.company_cnpj || ''}
                onChange={(event) => onUpdate('company_cnpj', maskCNPJ(event.target.value))}
                placeholder="00.000.000/0001-00"
                className={`${inputClass} ${errorClass('company_cnpj')}`}
              />
              {getError('company_cnpj') && (
                <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {getError('company_cnpj')?.message}
                </span>
              )}
            </div>
          </label>
          <label className="text-sm text-slate-300 space-y-2 lg:col-span-2 group">
            <FieldLabel label="Descrição curta" settingKey={KEY_MAP.company_description} />
            <textarea aria-label="Descrição curta" value={settings.company_description || ''} onChange={(e) => onUpdate('company_description', e.target.value)} className={textareaClass} />
          </label>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-[15px] font-semibold text-white mb-4">Endereço</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div data-field="address_zip" className="group">
            <FieldLabel label="CEP" settingKey={KEY_MAP.address_zip} />
            <div className="relative">
              <input
              aria-label="CEP"
                placeholder="00000-000"
                value={settings.address_zip || ''}
                onChange={(event) => void handleCepChange(event.target.value)}
                className={`${inputClass} ${errorClass('address_zip')}`}
              />
              {cepLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-[#0ea5e9] animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
            {getError('address_zip') && (
              <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {getError('address_zip')?.message}
              </span>
            )}
          </div>

          <label className="text-sm text-slate-300 space-y-2 group">
            <FieldLabel label="Logradouro" settingKey={KEY_MAP.address_street} />
            <input aria-label="Logradouro" placeholder="Logradouro" value={settings.address_street || ''} onChange={(e) => onUpdate('address_street', e.target.value)} className={inputClass} />
          </label>

          <label className="text-sm text-slate-300 space-y-2 group">
            <FieldLabel label="Bairro" settingKey={KEY_MAP.address_neighborhood} />
            <input aria-label="Bairro" placeholder="Bairro" value={settings.address_neighborhood || ''} onChange={(e) => onUpdate('address_neighborhood', e.target.value)} className={inputClass} />
          </label>

          <label className="text-sm text-slate-300 space-y-2 group">
            <FieldLabel label="Complemento" settingKey={KEY_MAP.address_complement} />
            <input aria-label="Complemento" placeholder="Complemento" value={settings.address_complement || ''} onChange={(e) => onUpdate('address_complement', e.target.value)} className={inputClass} />
          </label>

          <label className="text-sm text-slate-300 space-y-2 group">
            <FieldLabel label="Cidade" settingKey={KEY_MAP.address_city} />
            <input aria-label="Cidade" placeholder="Cidade" value={settings.address_city || ''} onChange={(e) => onUpdate('address_city', e.target.value)} className={inputClass} />
          </label>

          <label className="text-sm text-slate-300 space-y-2 group">
            <FieldLabel label="Estado" settingKey={KEY_MAP.address_state} />
            <select aria-label="Estado" value={settings.address_state || ''} onChange={(e) => onUpdate('address_state', e.target.value)} className={inputClass}>
              <option value="">Estado</option>
              {UF_OPTIONS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="text-sm text-slate-300 space-y-2 block mt-4 group" data-field="address_maps_url">
          <FieldLabel label="Google Maps URL" settingKey={KEY_MAP.address_maps_url} />
          <input
            aria-label="Google Maps URL"
            value={settings.address_maps_url || ''}
            onChange={(event) => onUpdate('address_maps_url', event.target.value)}
            className={`${inputClass} ${errorClass('address_maps_url')}`}
          />
          {getError('address_maps_url') && (
            <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {getError('address_maps_url')?.message}
            </span>
          )}
          <span className="text-xs text-slate-500">Cole o link de compartilhamento do Google Maps.</span>
        </label>
      </section>

      <section className={cardClass}>
        <h2 className="text-[15px] font-semibold text-white mb-4">Contato</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div data-field="phone_whatsapp" className="group">
            <FieldLabel label="WhatsApp" settingKey={KEY_MAP.phone_whatsapp} />
            <input
              placeholder="(00) 00000-0000"
              value={settings.phone_whatsapp || ''}
              onChange={(event) => onUpdate('phone_whatsapp', maskPhone(event.target.value))}
              className={`${inputClass} ${errorClass('phone_whatsapp')}`}
            />
            {getError('phone_whatsapp') && (
              <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {getError('phone_whatsapp')?.message}
              </span>
            )}
          </div>

          <div data-field="phone_landline" className="group">
            <FieldLabel label="Telefone fixo" settingKey={KEY_MAP.phone_landline} />
            <input
              placeholder="(00) 0000-0000"
              value={settings.phone_landline || ''}
              onChange={(event) => onUpdate('phone_landline', maskPhone(event.target.value))}
              className={`${inputClass} ${errorClass('phone_landline')}`}
            />
            {getError('phone_landline') && (
              <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {getError('phone_landline')?.message}
              </span>
            )}
          </div>

          <div data-field="email_main" className="group">
            <FieldLabel label="E-mail principal" settingKey={KEY_MAP.email_main} />
            <input
              placeholder="E-mail Principal *"
              value={settings.email_main || ''}
              onChange={(event) => onUpdate('email_main', event.target.value)}
              className={`${inputClass} ${errorClass('email_main')}`}
            />
            {getError('email_main') && (
              <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {getError('email_main')?.message}
              </span>
            )}
          </div>

          <div data-field="email_support" className="group">
            <FieldLabel label="E-mail suporte" settingKey={KEY_MAP.email_support} />
            <input
              placeholder="E-mail de Suporte"
              value={settings.email_support || ''}
              onChange={(event) => onUpdate('email_support', event.target.value)}
              className={`${inputClass} ${errorClass('email_support')}`}
            />
            {getError('email_support') && (
              <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {getError('email_support')?.message}
              </span>
            )}
          </div>
        </div>
        <label className="text-sm text-slate-300 space-y-2 block mt-4 group" data-field="email_privacy">
          <FieldLabel label="E-mail privacidade (DPO)" settingKey={KEY_MAP.email_privacy} />
          <input
            value={settings.email_privacy || ''}
            onChange={(event) => onUpdate('email_privacy', event.target.value)}
            className={`${inputClass} ${errorClass('email_privacy')}`}
          />
          {getError('email_privacy') && (
            <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {getError('email_privacy')?.message}
            </span>
          )}
          <span className="text-xs text-slate-500">Usado nas páginas de política de privacidade e cookies.</span>
        </label>
      </section>

      <section className={cardClass}>
        <h2 className="text-[15px] font-semibold text-white mb-4">Horário de Funcionamento</h2>
        <BusinessHoursEditor
          hours={hoursValue}
          onChange={(hours) => onUpdate('hours', JSON.stringify(hours))}
        />
        <label className="text-sm text-slate-300 space-y-2 block mt-4">
          <span className="text-slate-400">Observação de horário</span>
          <input value={settings.hours_note || ''} onChange={(e) => onUpdate('hours_note', e.target.value)} className={inputClass} />
        </label>
      </section>

      <section className={cardClass}>
        <h2 className="text-[15px] font-semibold text-white mb-4">Redes Sociais</h2>
        <SocialLinks values={settings} onUpdate={onUpdate} />
      </section>
    </div>
  )
}

function FieldLabel({ label, settingKey }: { label: string; settingKey: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`{{${settingKey}}}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // no-op
    }
  }

  return (
    <div className="flex items-center gap-2 mb-1">
      <span className={labelClass}>{label}</span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#64748b] hover:text-[#0ea5e9]"
        title={`Copiar: {{${settingKey}}}`}
      >
        {copied ? (
          <svg className="w-3 h-3 text-[#10b981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}

async function fetchAddressByCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data = await response.json()

    if (data.erro) return null

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      complement: data.complemento || '',
    }
  } catch {
    return null
  }
}
