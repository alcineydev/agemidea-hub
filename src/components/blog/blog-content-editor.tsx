'use client'

import { useEffect, useRef, useState } from 'react'

interface BlogContentEditorProps {
  value: string
  onChange: (value: string) => void
}

type EditorTab = 'visual' | 'simple' | 'html' | 'markdown'

const tabs: Array<{ id: EditorTab; label: string }> = [
  { id: 'visual', label: 'Editor Visual' },
  { id: 'simple', label: 'Texto Simples' },
  { id: 'html', label: 'HTML' },
  { id: 'markdown', label: 'Markdown' },
]

function toolbarClass(active: boolean) {
  return `rounded-md border px-2 py-1 text-[11px] transition-colors ${
    active
      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
      : 'border-[#1e1e2a] text-[#71717a] hover:text-[#e4e4e7]'
  }`
}

export default function BlogContentEditor({ value, onChange }: BlogContentEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('visual')
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab !== 'visual') return
    if (!editorRef.current) return
    if (editorRef.current.innerHTML === value) return
    editorRef.current.innerHTML = value || ''
  }, [activeTab, value])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const runCommand = (command: string, argument?: string) => {
    focusEditor()
    document.execCommand(command, false, argument)
    onChange(editorRef.current?.innerHTML || '')
  }

  const setBlock = (tag: 'H1' | 'H2' | 'H3' | 'BLOCKQUOTE' | 'PRE' | 'P') => {
    runCommand('formatBlock', tag)
  }

  const insertLink = () => {
    const url = window.prompt('URL do link (https://...)')
    if (!url) return
    runCommand('createLink', url)
  }

  const insertImage = () => {
    const url = window.prompt('URL da imagem')
    if (!url) return
    runCommand('insertImage', url)
  }

  const insertVideo = () => {
    const url = window.prompt('URL do video (YouTube/Vimeo)')
    if (!url) return
    runCommand(
      'insertHTML',
      `<div><iframe src="${url}" style="width:100%;min-height:320px;border:0;" allowfullscreen></iframe></div>`
    )
  }

  const onVisualInput = () => {
    onChange(editorRef.current?.innerHTML || '')
  }

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
          <button type="button" className={toolbarClass(false)} onClick={() => runCommand('bold')}>B</button>
          <button type="button" className={toolbarClass(false)} onClick={() => runCommand('italic')}>I</button>
          <button type="button" className={toolbarClass(false)} onClick={() => runCommand('underline')}>U</button>
          <button type="button" className={toolbarClass(false)} onClick={() => runCommand('strikeThrough')}>S</button>
          <button type="button" className={toolbarClass(false)} onClick={() => setBlock('H1')}>H1</button>
          <button type="button" className={toolbarClass(false)} onClick={() => setBlock('H2')}>H2</button>
          <button type="button" className={toolbarClass(false)} onClick={() => setBlock('H3')}>H3</button>
          <button type="button" className={toolbarClass(false)} onClick={insertLink}>Link</button>
          <button type="button" className={toolbarClass(false)} onClick={insertImage}>Img</button>
          <button type="button" className={toolbarClass(false)} onClick={insertVideo}>Video</button>
          <button type="button" className={toolbarClass(false)} onClick={() => runCommand('insertUnorderedList')}>Lista</button>
          <button type="button" className={toolbarClass(false)} onClick={() => runCommand('insertOrderedList')}>Num</button>
          <button type="button" className={toolbarClass(false)} onClick={() => setBlock('BLOCKQUOTE')}>Quote</button>
          <button type="button" className={toolbarClass(false)} onClick={() => setBlock('PRE')}>Code</button>
          <button type="button" className={toolbarClass(false)} onClick={() => runCommand('insertHorizontalRule')}>---</button>
        </div>
      </div>

      <div className="p-3">
        {activeTab === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={onVisualInput}
            className="min-h-[320px] w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
          />
        ) : (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              activeTab === 'html'
                ? 'Digite o HTML do artigo...'
                : activeTab === 'markdown'
                  ? 'Digite o Markdown do artigo...'
                  : 'Escreva seu texto aqui...'
            }
            className={`min-h-[320px] w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] p-3 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50 ${
              activeTab === 'html' || activeTab === 'markdown' ? 'font-mono' : ''
            }`}
          />
        )}
      </div>
    </section>
  )
}
