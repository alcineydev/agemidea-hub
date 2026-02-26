'use client'

import { useEffect, useRef } from 'react'

interface ModelHtmlRendererProps {
  html: string
  className?: string
  executeOnChangeKey?: string | number | boolean
}

export function ModelHtmlRenderer({ html, className, executeOnChangeKey }: ModelHtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = html

    const scripts = container.querySelectorAll('script')
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')

      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value)
      })

      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent
      }

      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })
  }, [html, executeOnChangeKey])

  return <div ref={containerRef} className={className} />
}
