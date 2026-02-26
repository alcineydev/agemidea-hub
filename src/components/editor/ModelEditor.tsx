'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  createModel,
  updateModel,
  type ModelFormData,
  type ModelRecord,
  type ModelStatus,
  type ModelType,
  type PopupFrequency,
  type PopupTrigger,
  type VisibilityMode,
} from '@/lib/actions/models'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
})

type EditorTab = 'html' | 'css' | 'javascript'

interface PageOption {
  id: string
  title: string
  slug: string
}

interface ModelEditorProps {
  mode: 'create' | 'edit'
  modelId?: string
  initialData?: ModelRecord | null
  pages: PageOption[]
}

const typeOptions: Array<{ value: ModelType; label: string }> = [
  { value: 'header', label: '🔝 Header' },
  { value: 'footer', label: '🔻 Footer' },
  { value: 'popup', label: '💬 Popup' },
  { value: 'card', label: '🃏 Card' },
]

const visibilityOptions: Array<{ value: VisibilityMode; label: string }> = [
  { value: 'all', label: '🌐 Todas as páginas' },
  { value: 'specific', label: '📌 Somente páginas específicas' },
  { value: 'exclude', label: '🚫 Todas, exceto páginas selecionadas' },
]

const popupTriggerOptions: Array<{ value: PopupTrigger; label: string }> = [
  { value: 'page_load', label: '🚀 Ao carregar a página' },
  { value: 'exit_intent', label: '🚪 Exit intent (ao mover mouse para sair)' },
  { value: 'scroll_percent', label: '📜 Scroll da página (ao atingir %)' },
  { value: 'timer', label: '⏱ Temporizador (após X segundos)' },
  { value: 'click', label: '👆 Ao clicar em elemento (via JS)' },
]

const popupFrequencyOptions: Array<{ value: PopupFrequency; label: string }> = [
  { value: 'always', label: 'Sempre' },
  { value: 'once', label: 'Uma vez (nunca mais)' },
  { value: 'once_per_session', label: 'Uma vez por sessão' },
  { value: 'once_per_day', label: 'Uma vez por dia' },
]

export function ModelEditor({ mode, modelId, initialData, pages }: ModelEditorProps) {
  const router = useRouter()

  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [modelType, setModelType] = useState<ModelType>(initialData?.model_type ?? 'header')
  const [status, setStatus] = useState<ModelStatus>(initialData?.status ?? 'ativo')
  const [priority, setPriority] = useState(initialData?.priority ?? 0)
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>(initialData?.visibility_mode ?? 'all')
  const [visibilityPages, setVisibilityPages] = useState<string[]>(initialData?.visibility_pages ?? [])
  const [popupTrigger, setPopupTrigger] = useState<PopupTrigger>(initialData?.popup_trigger ?? 'page_load')
  const [popupDelaySeconds, setPopupDelaySeconds] = useState<number>(initialData?.popup_delay_seconds ?? 0)
  const [popupScrollPercent, setPopupScrollPercent] = useState<number>(initialData?.popup_scroll_percent ?? 50)
  const [popupFrequency, setPopupFrequency] = useState<PopupFrequency>(initialData?.popup_show_frequency ?? 'always')
  const [popupCloseOnOverlay, setPopupCloseOnOverlay] = useState<boolean>(initialData?.popup_close_on_overlay ?? true)
  const [popupMobileEnabled, setPopupMobileEnabled] = useState<boolean>(initialData?.popup_mobile_enabled ?? true)
  const [htmlContent, setHtmlContent] = useState(initialData?.html_content ?? '')
  const [cssContent, setCssContent] = useState(initialData?.css_content ?? '')
  const [jsContent, setJsContent] = useState(initialData?.js_content ?? '')
  const [activeTab, setActiveTab] = useState<EditorTab>('html')
  const [showPreview, setShowPreview] = useState(true)
  const [loading, setLoading] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [debouncedPreview, setDebouncedPreview] = useState({
    html: initialData?.html_content ?? '',
    css: initialData?.css_content ?? '',
    js: initialData?.js_content ?? '',
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPreview({
        html: htmlContent,
        css: cssContent,
        js: jsContent,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [htmlContent, cssContent, jsContent])

  useEffect(() => {
    if (visibilityMode === 'all' && visibilityPages.length > 0) {
      setVisibilityPages([])
    }
  }, [visibilityMode, visibilityPages.length])

  const previewHtml = useMemo(
    () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${debouncedPreview.css}</style>
</head>
<body>
  ${debouncedPreview.html}
  <script>${debouncedPreview.js}<\/script>
</body>
</html>`,
    [debouncedPreview]
  )

  const currentEditorValue =
    activeTab === 'html' ? htmlContent : activeTab === 'css' ? cssContent : jsContent
  const popupModelId = initialData?.id ?? modelId ?? ''

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copiado!')
      })
      .catch(() => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success('Copiado!')
      })
  }

  const togglePageSelection = (pageId: string, checked: boolean) => {
    if (checked) {
      setVisibilityPages((prev) => [...prev, pageId])
      return
    }
    setVisibilityPages((prev) => prev.filter((id) => id !== pageId))
  }

  const validate = () => {
    if (!name.trim()) {
      toast.error('O nome do modelo é obrigatório.')
      return false
    }
    if (!modelType) {
      toast.error('Selecione o tipo do modelo.')
      return false
    }
    return true
  }

  const buildPayload = (): ModelFormData => ({
    name: name.trim(),
    description: description.trim(),
    model_type: modelType,
    html_content: htmlContent,
    css_content: cssContent,
    js_content: jsContent,
    visibility_mode: visibilityMode,
    visibility_pages: visibilityMode === 'all' ? [] : visibilityPages,
    popup_trigger: modelType === 'popup' ? popupTrigger : null,
    popup_delay_seconds: modelType === 'popup' ? popupDelaySeconds : 0,
    popup_scroll_percent: modelType === 'popup' ? popupScrollPercent : 50,
    popup_show_frequency: modelType === 'popup' ? popupFrequency : 'always',
    popup_close_on_overlay: modelType === 'popup' ? popupCloseOnOverlay : true,
    popup_mobile_enabled: modelType === 'popup' ? popupMobileEnabled : true,
    status,
    priority: Number.isNaN(priority) ? 0 : priority,
  })

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = buildPayload()
      if (mode === 'edit' && modelId) {
        await updateModel(modelId, payload)
      } else {
        await createModel(payload)
      }

      toast.success('Modelo salvo com sucesso.')
      router.push('/painel/paginas/modelos')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar o modelo.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/80 rounded-xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/painel/paginas/modelos"
              className="px-3 py-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30] transition-colors text-sm"
            >
              ← Voltar
            </Link>
            <h1 className="text-lg lg:text-xl font-semibold text-white">{name || 'Novo modelo'}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatus((prev) => (prev === 'ativo' ? 'inativo' : 'ativo'))}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                status === 'ativo' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-600/20 text-slate-300'
              }`}
            >
              {status === 'ativo' ? '● Ativo' : '○ Inativo'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Salvando...' : '💾 Salvar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5">
            <label htmlFor="model-name" className="text-xs text-[#94a3b8] mb-1 block">
              Nome do Modelo
            </label>
            <input
              id="model-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Header institucional"
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
            />
          </div>
          <div className="lg:col-span-4">
            <label htmlFor="model-description" className="text-xs text-[#94a3b8] mb-1 block">
              Descrição
            </label>
            <input
              id="model-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Opcional"
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="model-type" className="text-xs text-[#94a3b8] mb-1 block">
              Tipo
            </label>
            <select
              id="model-type"
              value={modelType}
              onChange={(event) => setModelType(event.target.value as ModelType)}
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="model-priority" className="text-xs text-[#94a3b8] mb-1 block">
              Prioridade
            </label>
            <input
              id="model-priority"
              type="number"
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value))}
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/80 rounded-xl p-4 space-y-3">
        <h2 className="text-white font-semibold">👁 Visibilidade</h2>
        <div className="space-y-2">
          {visibilityOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-[#cbd5e1] cursor-pointer">
              <input
                type="radio"
                name="visibility-mode"
                value={option.value}
                checked={visibilityMode === option.value}
                onChange={(event) => setVisibilityMode(event.target.value as VisibilityMode)}
                className="accent-[#0ea5e9]"
              />
              {option.label}
            </label>
          ))}
        </div>

        {visibilityMode !== 'all' && (
          <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
            <p className="text-sm text-[#cbd5e1] mb-2">Selecionar páginas:</p>
            <div className="space-y-2 max-h-48 overflow-auto pr-1">
              {pages.map((page) => (
                <label key={page.id} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                  <input
                    type="checkbox"
                    checked={visibilityPages.includes(page.id)}
                    onChange={(event) => togglePageSelection(page.id, event.target.checked)}
                    className="accent-[#0ea5e9] mt-0.5"
                  />
                  <span>
                    {page.title}
                    <span className="block text-xs text-[#64748b] font-mono">/{page.slug}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {modelType === 'popup' && (
        <>
          <div className="bg-[#0a0f1e] border border-[#1e3a5f]/80 rounded-xl p-4 space-y-3">
            <h2 className="text-white font-semibold">💬 Configurações do Popup</h2>
            <div className="space-y-2">
              {popupTriggerOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm text-[#cbd5e1] cursor-pointer">
                  <input
                    type="radio"
                    name="popup-trigger"
                    value={option.value}
                    checked={popupTrigger === option.value}
                    onChange={(event) => setPopupTrigger(event.target.value as PopupTrigger)}
                    className="accent-[#0ea5e9]"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {(popupTrigger === 'timer' || popupTrigger === 'page_load') && (
              <div>
                <label htmlFor="popup-delay" className="text-xs text-[#94a3b8] mb-1 block">
                  Atraso (segundos)
                </label>
                <input
                  id="popup-delay"
                  type="number"
                  value={popupDelaySeconds}
                  min={0}
                  onChange={(event) => setPopupDelaySeconds(Number(event.target.value))}
                  className="w-full lg:w-40 rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
                />
              </div>
            )}

            {popupTrigger === 'scroll_percent' && (
              <div>
                <label htmlFor="popup-scroll" className="text-xs text-[#94a3b8] mb-1 block">
                  Porcentagem de scroll
                </label>
                <input
                  id="popup-scroll"
                  type="number"
                  value={popupScrollPercent}
                  min={1}
                  max={100}
                  onChange={(event) => setPopupScrollPercent(Number(event.target.value))}
                  className="w-full lg:w-40 rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
                />
              </div>
            )}

            <div>
              <label htmlFor="popup-frequency" className="text-xs text-[#94a3b8] mb-1 block">
                Frequência de exibição
              </label>
              <select
                id="popup-frequency"
                value={popupFrequency}
                onChange={(event) => setPopupFrequency(event.target.value as PopupFrequency)}
                className="w-full lg:w-72 rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
              >
                {popupFrequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#cbd5e1]">
              <input
                type="checkbox"
                checked={popupCloseOnOverlay}
                onChange={(event) => setPopupCloseOnOverlay(event.target.checked)}
                className="accent-[#0ea5e9]"
              />
              Fechar ao clicar no overlay
            </label>
            <label className="flex items-center gap-2 text-sm text-[#cbd5e1]">
              <input
                type="checkbox"
                checked={popupMobileEnabled}
                onChange={(event) => setPopupMobileEnabled(event.target.checked)}
                className="accent-[#0ea5e9]"
              />
              Exibir em dispositivos móveis
            </label>
          </div>

          <div className="bg-[#0a0f1e] border border-[#1e3a5f]/80 rounded-xl p-4 space-y-3">
            <h2 className="text-white font-semibold">🔗 Código de Acionamento</h2>
            <p className="text-sm text-[#94a3b8]">
              Use um dos códigos abaixo em qualquer página para abrir este popup manualmente (ex: botão, link, banner).
            </p>

            {!popupModelId ? (
              <p className="text-sm text-amber-400">
                Salve o modelo primeiro para gerar o código de acionamento.
              </p>
            ) : (
              <>
                <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-[#94a3b8]">Botão HTML</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`<button onclick="agOpenPopup('${popupModelId}')">Texto</button>`)}
                      className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  <code className="text-xs text-[#cbd5e1] font-mono break-all">{`<button onclick="agOpenPopup('${popupModelId}')">Texto</button>`}</code>
                </div>

                <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-[#94a3b8]">Link HTML</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`<a href="#" onclick="agOpenPopup('${popupModelId}'); return false">Texto</a>`)}
                      className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  <code className="text-xs text-[#cbd5e1] font-mono break-all">{`<a href="#" onclick="agOpenPopup('${popupModelId}'); return false">Texto</a>`}</code>
                </div>

                <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-[#94a3b8]">Chamar via JS</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`agOpenPopup('${popupModelId}')`)}
                      className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  <code className="text-xs text-[#cbd5e1] font-mono break-all">{`agOpenPopup('${popupModelId}')`}</code>
                </div>

                <div className="rounded-lg border border-[#1e3a5f] bg-[#050510] p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-[#94a3b8]">Classe CSS (em qualquer elemento)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`class="ag-trigger-popup" data-popup-id="${popupModelId}"`)}
                      className="text-xs px-2 py-1 rounded-md border border-[#1e3a5f] text-[#cbd5e1] hover:bg-[#1e3a5f30]"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  <code className="text-xs text-[#cbd5e1] font-mono break-all">{`class="ag-trigger-popup" data-popup-id="${popupModelId}"`}</code>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/80 rounded-xl p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-[#1e3a5f]/60 pb-3">
          <div className="flex items-center gap-2">
            {(['html', 'css', 'javascript'] as EditorTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab ? 'bg-[#1e3a5f] text-white' : 'text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30]'
                }`}
              >
                {tab === 'html' && '🟧 HTML'}
                {tab === 'css' && '🟦 CSS'}
                {tab === 'javascript' && '🟨 JS'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            className="hidden lg:inline-flex px-3 py-1.5 rounded-lg border border-[#1e3a5f] text-[#94a3b8] text-sm hover:text-white hover:bg-[#1e3a5f30]"
          >
            {showPreview ? '▶ Esconder Preview' : '◀ Mostrar Preview'}
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-3 pt-3 min-h-[520px]">
          <div className={`${showPreview ? 'lg:w-1/2' : 'lg:w-full'} w-full rounded-lg overflow-hidden border border-[#1e3a5f]/70`}>
            <MonacoEditor
              theme="vs-dark"
              language={activeTab}
              value={currentEditorValue}
              onMount={(editor) => {
                setCursorPosition({
                  line: editor.getPosition()?.lineNumber ?? 1,
                  column: editor.getPosition()?.column ?? 1,
                })
                editor.onDidChangeCursorPosition((event) => {
                  setCursorPosition({
                    line: event.position.lineNumber,
                    column: event.position.column,
                  })
                })
              }}
              onChange={(value = '') => {
                if (activeTab === 'html') setHtmlContent(value)
                if (activeTab === 'css') setCssContent(value)
                if (activeTab === 'javascript') setJsContent(value)
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
              height="100%"
            />
          </div>

          {(showPreview || typeof window === 'undefined') && (
            <div className={`${showPreview ? 'lg:w-1/2' : 'hidden'} w-full rounded-lg border border-[#1e3a5f]/70 bg-white overflow-hidden`}>
              <div className="h-10 bg-[#f1f5f9] border-b border-slate-300 flex items-center justify-between px-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="text-[11px] text-slate-600 font-medium">PREVIEW AO VIVO</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">https://agemidea.com/modelo/{modelType}</div>
              </div>
              <iframe title="Preview ao vivo do modelo" srcDoc={previewHtml} className="w-full h-[calc(100%-40px)] bg-white" />
            </div>
          )}
        </div>

        <div className="border-t border-[#1e3a5f]/60 mt-3 pt-3 flex items-center justify-between text-xs text-[#64748b]">
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
          <span>Monaco Editor — UTF-8</span>
        </div>
      </div>
    </div>
  )
}
