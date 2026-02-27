'use client'

import type { BusinessHourDay, BusinessHours as BusinessHoursType } from '../types'

interface Props {
  hours: BusinessHoursType
  onChange: (hours: BusinessHoursType) => void
}

const DAYS = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
] as const

const inputClass =
  'bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3 py-2 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none disabled:opacity-40'

export default function BusinessHours({ hours, onChange }: Props) {
  const updateDay = (day: keyof BusinessHoursType, field: keyof BusinessHourDay, value: string | boolean) => {
    onChange({
      ...hours,
      [day]: { ...hours[day], [field]: value },
    })
  }

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const day = hours[key]
        return (
          <div key={key} className="grid grid-cols-[42px_1fr_auto_1fr_auto] gap-2 items-center text-sm">
            <span className="text-slate-400 font-medium">{label}</span>
            <input
              type="time"
              value={day.open}
              onChange={(event) => updateDay(key, 'open', event.target.value)}
              disabled={!day.active}
              className={inputClass}
            />
            <span className="text-slate-500 text-xs text-center">às</span>
            <input
              type="time"
              value={day.close}
              onChange={(event) => updateDay(key, 'close', event.target.value)}
              disabled={!day.active}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => updateDay(key, 'active', !day.active)}
              className={`w-9 h-5 rounded-full relative transition-all ${
                day.active ? 'bg-cyan-500/30' : 'bg-slate-700/30'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  day.active ? 'left-[18px] bg-cyan-400' : 'left-0.5 bg-slate-500'
                }`}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}
