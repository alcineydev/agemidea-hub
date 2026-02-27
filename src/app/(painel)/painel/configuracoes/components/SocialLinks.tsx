'use client'

interface Props {
  values: Record<string, string>
  onUpdate: (key: string, value: string) => void
}

const inputClass =
  'w-full bg-[rgba(15,23,42,.8)] border border-[rgba(30,58,95,.35)] rounded-[10px] text-slate-200 text-sm px-3.5 py-2.5 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(14,165,233,.08)] outline-none'

const socials = [
  { key: 'social_facebook', label: 'Facebook' },
  { key: 'social_instagram', label: 'Instagram' },
  { key: 'social_linkedin', label: 'LinkedIn' },
  { key: 'social_twitter', label: 'Twitter/X' },
  { key: 'social_youtube', label: 'YouTube' },
]

export default function SocialLinks({ values, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      {socials.map((social) => (
        <label key={social.key} className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg border border-[rgba(30,58,95,.35)] bg-[rgba(30,58,95,.15)] flex items-center justify-center text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <input
            placeholder={`URL do ${social.label}`}
            value={values[social.key] || ''}
            onChange={(event) => onUpdate(social.key, event.target.value)}
            className={inputClass}
          />
        </label>
      ))}
    </div>
  )
}
