'use client'

interface Props {
  activeTab: 'visual' | 'empresa'
  onChange: (tab: 'visual' | 'empresa') => void
}

export default function SettingsTabs({ activeTab, onChange }: Props) {
  const tabs = [
    { id: 'visual' as const, label: 'Identidade Visual' },
    { id: 'empresa' as const, label: 'Informações da Empresa' },
  ]

  return (
    <div className="flex-shrink-0 flex gap-1 px-4 md:px-8 border-b border-[rgba(30,58,95,.2)] bg-[#0a0f1e] overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 md:px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
