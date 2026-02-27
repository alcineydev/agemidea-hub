'use client'

import { useMemo } from 'react'

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

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[15px] font-semibold text-white">Dados da Empresa</h2>
          <span className="text-[11px] px-2 py-1 rounded-md font-semibold bg-cyan-500/10 text-cyan-400">Público</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="text-sm text-slate-300 space-y-2">
            <span className={labelClass}>Nome da Empresa *</span>
            <input value={settings.company_name || ''} onChange={(e) => onUpdate('company_name', e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm text-slate-300 space-y-2">
            <span className={labelClass}>CNPJ</span>
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
          <label className="text-sm text-slate-300 space-y-2 lg:col-span-2">
            <span className={labelClass}>Descrição curta</span>
            <textarea value={settings.company_description || ''} onChange={(e) => onUpdate('company_description', e.target.value)} className={textareaClass} />
          </label>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-[15px] font-semibold text-white mb-4">Endereço</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <input placeholder="Logradouro" value={settings.address_street || ''} onChange={(e) => onUpdate('address_street', e.target.value)} className={inputClass} />
          <input placeholder="Complemento" value={settings.address_complement || ''} onChange={(e) => onUpdate('address_complement', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <input placeholder="Cidade" value={settings.address_city || ''} onChange={(e) => onUpdate('address_city', e.target.value)} className={inputClass} />
          <select value={settings.address_state || ''} onChange={(e) => onUpdate('address_state', e.target.value)} className={inputClass}>
            <option value="">Estado</option>
            {UF_OPTIONS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          <div data-field="address_zip">
            <input
              placeholder="00000-000"
              value={settings.address_zip || ''}
              onChange={(event) => onUpdate('address_zip', maskCEP(event.target.value))}
              className={`${inputClass} ${errorClass('address_zip')}`}
            />
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
        </div>
        <label className="text-sm text-slate-300 space-y-2 block mt-4" data-field="address_maps_url">
          <span className="text-slate-400">Google Maps URL</span>
          <input
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
          <div data-field="phone_whatsapp">
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
          <div data-field="phone_landline">
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
          <div data-field="email_main">
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
          <div data-field="email_support">
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
        <label className="text-sm text-slate-300 space-y-2 block mt-4" data-field="email_privacy">
          <span className="text-slate-400">E-mail de Privacidade (DPO)</span>
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
