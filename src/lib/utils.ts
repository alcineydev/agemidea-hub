import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, { hour: '2-digit', minute: '2-digit' })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'agora mesmo'
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return formatDate(date)
}

export const projectStatusConfig = {
  briefing: { label: 'Briefing', color: 'bg-blue-100 text-blue-800' },
  em_andamento: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
  revisao: { label: 'Revisão', color: 'bg-purple-100 text-purple-800' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
} as const

export const ticketStatusConfig = {
  aberto: { label: 'Aberto', color: 'bg-blue-100 text-blue-800' },
  em_atendimento: { label: 'Em Atendimento', color: 'bg-yellow-100 text-yellow-800' },
  aguardando_cliente: {
    label: 'Aguardando Cliente',
    color: 'bg-orange-100 text-orange-800',
  },
  resolvido: { label: 'Resolvido', color: 'bg-green-100 text-green-800' },
  fechado: { label: 'Fechado', color: 'bg-gray-100 text-gray-800' },
} as const

export const leadStatusConfig = {
  novo: { label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  contatado: { label: 'Contatado', color: 'bg-yellow-100 text-yellow-800' },
  qualificado: { label: 'Qualificado', color: 'bg-green-100 text-green-800' },
  descartado: { label: 'Descartado', color: 'bg-red-100 text-red-800' },
} as const

export const postStatusConfig = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
  publicado: { label: 'Publicado', color: 'bg-green-100 text-green-800' },
  agendado: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  arquivado: { label: 'Arquivado', color: 'bg-yellow-100 text-yellow-800' },
} as const

export const pageStatusConfig = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
  publicada: { label: 'Publicada', color: 'bg-green-100 text-green-800' },
  desativada: { label: 'Desativada', color: 'bg-red-100 text-red-800' },
} as const
