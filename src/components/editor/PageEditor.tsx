'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { Page } from '@/types'
import { slugify } from '@/lib/utils'
import type { PageFormData, PageStatus, PageType } from '@/lib/actions/pages'
import { createPage, updatePage } from '@/lib/actions/pages'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.default), {
  ssr: false,
})

type EditorTab = 'html' | 'css' | 'javascript'
type SaveIntent = 'draft' | 'publish' | null

interface PageEditorProps {
  mode: 'create' | 'edit'
  pageId?: string
  initialData?: Page | null
}

const TAB_CONFIG: Record<EditorTab, { label: string; icon: string }> = {
  html: { label: 'HTML', icon: '🟧' },
  css: { label: 'CSS', icon: '🟦' },
  javascript: { label: 'JS', icon: '🟨' },
}

const TYPE_OPTIONS: Array<{ value: PageType; label: string }> = [
  { value: 'home', label: '🏠 Home' },
  { value: 'normal', label: '📄 Normal' },
  { value: '404', label: '⚠️ 404' },
  { value: 'blog', label: '📝 Blog' },
]

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function PageEditor({ mode, pageId, initialData }: PageEditorProps) {
  const router = useRouter()
  const initialStatus: PageStatus = initialData?.status === 'publicada' ? 'publicada' : 'rascunho'
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [pageType, setPageType] = useState<PageType>(initialData?.page_type ?? 'normal')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [status, setStatus] = useState<PageStatus>(initialStatus)
  const [showInMenu, setShowInMenu] = useState(initialData?.show_in_menu ?? false)
  const [menuOrder, setMenuOrder] = useState(initialData?.menu_order ?? 0)
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? '')
  const [htmlContent, setHtmlContent] = useState(initialData?.html_content ?? '')
  const [cssContent, setCssContent] = useState(initialData?.css_content ?? '')
  const [jsContent, setJsContent] = useState(initialData?.js_content ?? '')
  const [activeTab, setActiveTab] = useState<EditorTab>('html')
  const [showSeo, setShowSeo] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug))
  const [saveIntent, setSaveIntent] = useState<SaveIntent>(null)
  const [debouncedPreview, setDebouncedPreview] = useState({
    html: htmlContent,
    css: cssContent,
    js: jsContent,
  })
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

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
    if (pageType === 'home') {
      setSlug('')
      return
    }

    if (!slugTouched) {
      setSlug(slugify(title))
    }
  }, [pageType, title, slugTouched])

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

  const isLoading = saveIntent !== null

  const validate = (): boolean => {
    if (!title.trim()) {
      toast.error('O título é obrigatório.')
      return false
    }

    if (pageType !== 'home') {
      if (!slug.trim()) {
        toast.error('O slug é obrigatório para este tipo de página.')
        return false
      }
      if (!SLUG_REGEX.test(slug)) {
        toast.error('O slug deve conter apenas letras minúsculas, números e hífens.')
        return false
      }
    }

    return true
  }

  const buildPayload = (targetStatus: PageStatus): PageFormData => ({
    title: title.trim(),
    slug: pageType === 'home' ? '' : slug.trim(),
    page_type: pageType,
    status: targetStatus,
    html_content: htmlContent,
    css_content: cssContent,
    js_content: jsContent,
    meta_title: metaTitle.trim() || title.trim(),
    meta_description: metaDescription.trim(),
    show_in_menu: showInMenu,
    menu_order: Number.isNaN(menuOrder) ? 0 : menuOrder,
  })

  const handleSave = async (targetStatus: PageStatus) => {
    if (!validate()) return

    const intent: SaveIntent = targetStatus === 'publicada' ? 'publish' : 'draft'
    setSaveIntent(intent)

    try {
      const payload = buildPayload(targetStatus)
      if (mode === 'edit' && pageId) {
        await updatePage(pageId, payload)
      } else {
        await createPage(payload)
      }

      toast.success(targetStatus === 'publicada' ? 'Página publicada com sucesso.' : 'Rascunho salvo com sucesso.')
      router.push('/painel/paginas')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar a página.'
      toast.error(message)
    } finally {
      setSaveIntent(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/80 rounded-xl p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/painel/paginas"
              className="px-3 py-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30] transition-colors text-sm"
            >
              ← Voltar
            </Link>
            <h1 className="text-lg lg:text-xl font-semibold text-white">{title || 'Nova página'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('rascunho')}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[#1e3a5f] border border-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#23456f] transition-colors disabled:opacity-60"
            >
              {saveIntent === 'draft' ? 'Salvando...' : '💾 Salvar rascunho'}
            </button>
            <button
              type="button"
              onClick={() => handleSave('publicada')}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saveIntent === 'publish' ? 'Publicando...' : '🚀 Publicar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6">
            <label htmlFor="page-title" className="text-xs text-[#94a3b8] mb-1 block">
              Título
            </label>
            <input
              id="page-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
              placeholder="Ex: Sobre nós"
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="page-type" className="text-xs text-[#94a3b8] mb-1 block">
              Tipo
            </label>
            <select
              id="page-type"
              value={pageType}
              onChange={(event) => setPageType(event.target.value as PageType)}
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-4">
            <label htmlFor="page-slug" className="text-xs text-[#94a3b8] mb-1 block">
              Slug
            </label>
            <div className="flex rounded-lg border border-[#1e3a5f] overflow-hidden bg-[#050510]">
              <span className="px-3 py-2 text-[#64748b] text-sm border-r border-[#1e3a5f]">/</span>
              <input
                id="page-slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  setSlug(slugify(event.target.value))
                }}
                disabled={pageType === 'home'}
                className="w-full bg-transparent text-white px-3 py-2 text-sm outline-none disabled:opacity-50"
                placeholder={pageType === 'home' ? 'home não usa slug' : 'minha-pagina'}
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button
              type="button"
              onClick={() => setStatus((prev) => (prev === 'publicada' ? 'rascunho' : 'publicada'))}
              className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                status === 'publicada' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-600/20 text-amber-400'
              }`}
            >
              {status === 'publicada' ? '● Publicada' : '● Rascunho'}
            </button>
          </div>
          <div className="lg:col-span-2 flex items-end">
            <button
              type="button"
              onClick={() => setShowSeo((prev) => !prev)}
              className="w-full rounded-lg border border-[#1e3a5f] px-3 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30] transition-colors"
            >
              🔍 SEO
            </button>
          </div>
          <div className="lg:col-span-4 flex items-center gap-3 pt-4 lg:pt-0">
            <label className="inline-flex items-center gap-2 text-sm text-[#cbd5e1]">
              <input
                type="checkbox"
                checked={showInMenu}
                onChange={(event) => setShowInMenu(event.target.checked)}
                className="accent-[#0ea5e9]"
              />
              Mostrar no menu
            </label>
          </div>
          <div className="lg:col-span-4">
            <label htmlFor="menu-order" className="text-xs text-[#94a3b8] mb-1 block">
              Ordem no menu
            </label>
            <input
              id="menu-order"
              type="number"
              value={menuOrder}
              onChange={(event) => setMenuOrder(Number(event.target.value))}
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
            />
          </div>
        </div>

        {showSeo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 border-t border-[#1e3a5f]/70 pt-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="meta-title" className="text-xs text-[#94a3b8]">
                  Meta Title
                </label>
                <span className="text-[11px] text-[#64748b]">{metaTitle.length}/60</span>
              </div>
              <input
                id="meta-title"
                value={metaTitle}
                maxLength={60}
                onChange={(event) => setMetaTitle(event.target.value)}
                className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="meta-description" className="text-xs text-[#94a3b8]">
                  Meta Description
                </label>
                <span className="text-[11px] text-[#64748b]">{metaDescription.length}/160</span>
              </div>
              <textarea
                id="meta-description"
                value={metaDescription}
                maxLength={160}
                onChange={(event) => setMetaDescription(event.target.value)}
                className="w-full rounded-lg border border-[#1e3a5f] bg-[#050510] text-white px-3 py-2 text-sm outline-none focus:border-[#0ea5e9] min-h-[74px]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#0a0f1e] border border-[#1e3a5f]/80 rounded-xl p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-[#1e3a5f]/60 pb-3">
          <div className="flex items-center gap-2">
            {(Object.keys(TAB_CONFIG) as EditorTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab ? 'bg-[#1e3a5f] text-white' : 'text-[#94a3b8] hover:text-white hover:bg-[#1e3a5f30]'
                }`}
              >
                {TAB_CONFIG[tab].icon} {TAB_CONFIG[tab].label}
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
              onMount={(editorInstance) => {
                setCursorPosition({
                  line: editorInstance.getPosition()?.lineNumber ?? 1,
                  column: editorInstance.getPosition()?.column ?? 1,
                })
                editorInstance.onDidChangeCursorPosition((event) => {
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
                <div className="text-[11px] text-slate-500 font-mono truncate">https://agemidea.com/{slug}</div>
              </div>
              <iframe title="Preview ao vivo" srcDoc={previewHtml} className="w-full h-[calc(100%-40px)] bg-white" />
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
