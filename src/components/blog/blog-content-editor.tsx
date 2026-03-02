'use client'

import { useMemo, useState } from 'react'

interface BlogContentEditorProps {
  value: string
  onChange: (value: string) => void
}

type EditorTab = 'visual' | 'html' | 'markdown'

const tabs: Array<{ id: EditorTab; label: string }> = [
  { id: 'visual', label: 'Editor Visual' },
  { id: 'html', label: 'HTML' },
  { id: 'markdown', label: 'Markdown' },
]

export default function BlogContentEditor({ value, onChange }: BlogContentEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('html')

  const toolbarButtons = useMemo(
    () => ['B', 'I', 'U', 'S', 'H1', 'H2', 'H3', 'Link', 'Img', 'Video', 'Lista', 'Num', 'Quote', 'Code', '---'],
    []
  )

  return (
    <section className="rounded-xl border border-[#1e1e2a] bg-[#111118]">
      <div className="border-b border-[#1e1e2a] px-3 pt-3">
        <div className="mb-3 flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                  : 'border-[#1e1e2a] text-[#71717a] hover:text-[#e4e4e7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {toolbarButtons.map((button) => (
            <button
              key={button}
              type="button"
              className="rounded-md border border-[#1e1e2a] px-2 py-1 text-[11px] text-[#71717a] hover:text-[#e4e4e7]"
              title={`Ferramenta ${button}`}
            >
              {button}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3">
        {activeTab === 'visual' ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-[#1e1e2a] bg-[#0a0a0f] p-5 text-center text-sm text-[#71717a]">
            Editor visual em breve. Use HTML ou Markdown no momento.
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              activeTab === 'html'
                ? 'Digite o HTML do artigo...'
                : 'Digite o Markdown do artigo...'
            }
            className="min-h-[320px] w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3 font-mono text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
          />
        )}
      </div>
    </section>
  )
}
