export interface SiteSetting {
  id: string
  key: string
  value: string
  type: 'text' | 'image' | 'json'
  updated_at: string
}

export interface SettingsMap {
  [key: string]: string
}

export interface BusinessHourDay {
  open: string
  close: string
  active: boolean
}

export interface BusinessHours {
  seg: BusinessHourDay
  ter: BusinessHourDay
  qua: BusinessHourDay
  qui: BusinessHourDay
  sex: BusinessHourDay
  sab: BusinessHourDay
  dom: BusinessHourDay
}

export type LogoType = 'image' | 'text'
export type PreviewTheme = 'dark' | 'light'

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  seg: { open: '08:00', close: '18:00', active: true },
  ter: { open: '08:00', close: '18:00', active: true },
  qua: { open: '08:00', close: '18:00', active: true },
  qui: { open: '08:00', close: '18:00', active: true },
  sex: { open: '08:00', close: '18:00', active: true },
  sab: { open: '09:00', close: '13:00', active: false },
  dom: { open: '09:00', close: '13:00', active: false },
}
