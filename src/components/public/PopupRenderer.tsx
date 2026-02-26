'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ModelRecord } from '@/lib/actions/models'

interface PopupRendererProps {
  popups: ModelRecord[]
}

const DAY_MS = 24 * 60 * 60 * 1000

function hasFrequencyLock(popup: ModelRecord): boolean {
  if (popup.popup_show_frequency === 'always') return false
  if (typeof window === 'undefined') return false

  const localKey = `popup_seen_${popup.id}`
  const sessionKey = `popup_seen_session_${popup.id}`

  if (popup.popup_show_frequency === 'once') {
    return localStorage.getItem(localKey) === '1'
  }

  if (popup.popup_show_frequency === 'once_per_session') {
    return sessionStorage.getItem(sessionKey) === '1'
  }

  const stored = localStorage.getItem(`${localKey}_date`)
  if (!stored) return false

  const timestamp = Number(stored)
  if (Number.isNaN(timestamp)) return false
  return Date.now() - timestamp < DAY_MS
}

function markFrequencyLock(popup: ModelRecord) {
  if (popup.popup_show_frequency === 'always') return
  if (typeof window === 'undefined') return

  const localKey = `popup_seen_${popup.id}`
  const sessionKey = `popup_seen_session_${popup.id}`

  if (popup.popup_show_frequency === 'once') {
    localStorage.setItem(localKey, '1')
    return
  }

  if (popup.popup_show_frequency === 'once_per_session') {
    sessionStorage.setItem(sessionKey, '1')
    return
  }

  localStorage.setItem(`${localKey}_date`, Date.now().toString())
}

function canShowOnCurrentDevice(popup: ModelRecord): boolean {
  if (typeof window === 'undefined') return true
  if (popup.popup_mobile_enabled) return true
  return window.innerWidth >= 768
}

export function PopupRenderer({ popups }: PopupRendererProps) {
  const [visiblePopups, setVisiblePopups] = useState<string[]>([])

  const popupMap = useMemo(() => new Map(popups.map((popup) => [popup.id, popup])), [popups])

  useEffect(() => {
    if (popups.length === 0) return

    const cleanups: Array<() => void> = []
    const alreadyTriggered = new Set<string>()

    const showPopup = (popup: ModelRecord) => {
      if (alreadyTriggered.has(popup.id)) return
      if (hasFrequencyLock(popup)) return
      if (!canShowOnCurrentDevice(popup)) return

      alreadyTriggered.add(popup.id)
      markFrequencyLock(popup)
      setVisiblePopups((prev) => (prev.includes(popup.id) ? prev : [...prev, popup.id]))
    }

    popups.forEach((popup) => {
      if (popup.popup_trigger === 'page_load') {
        const timer = window.setTimeout(() => showPopup(popup), Math.max(popup.popup_delay_seconds, 0) * 1000)
        cleanups.push(() => window.clearTimeout(timer))
        return
      }

      if (popup.popup_trigger === 'timer') {
        const timer = window.setTimeout(() => showPopup(popup), Math.max(popup.popup_delay_seconds, 0) * 1000)
        cleanups.push(() => window.clearTimeout(timer))
        return
      }

      if (popup.popup_trigger === 'exit_intent') {
        const onMouseOut = (event: MouseEvent) => {
          if (event.clientY <= 0) showPopup(popup)
        }
        document.addEventListener('mouseout', onMouseOut)
        cleanups.push(() => document.removeEventListener('mouseout', onMouseOut))
        return
      }

      if (popup.popup_trigger === 'scroll_percent') {
        const onScroll = () => {
          const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
          if (scrollableHeight <= 0) return
          const percent = (window.scrollY / scrollableHeight) * 100
          if (percent >= popup.popup_scroll_percent) showPopup(popup)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        cleanups.push(() => window.removeEventListener('scroll', onScroll))
        return
      }

      const customEventName = `show-popup-${popup.id}`
      const onCustomEvent = () => showPopup(popup)
      const onClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null
        const element = target?.closest(`[data-popup-id="${popup.id}"]`)
        if (element) showPopup(popup)
      }

      window.addEventListener(customEventName, onCustomEvent as EventListener)
      document.addEventListener('click', onClick)
      cleanups.push(() => {
        window.removeEventListener(customEventName, onCustomEvent as EventListener)
        document.removeEventListener('click', onClick)
      })
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [popups])

  const closePopup = (popupId: string) => {
    setVisiblePopups((prev) => prev.filter((id) => id !== popupId))
  }

  return (
    <>
      {visiblePopups.map((popupId) => {
        const popup = popupMap.get(popupId)
        if (!popup) return null

        return (
          <div key={popup.id} className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
              onClick={() => {
                if (popup.popup_close_on_overlay) closePopup(popup.id)
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="relative z-[91] w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
              {popup.css_content && <style dangerouslySetInnerHTML={{ __html: popup.css_content }} />}
              <button
                type="button"
                onClick={() => closePopup(popup.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 text-white text-sm hover:bg-black/80"
              >
                ✕
              </button>
              <div dangerouslySetInnerHTML={{ __html: popup.html_content || '' }} />
              {popup.js_content && <script dangerouslySetInnerHTML={{ __html: popup.js_content }} />}
            </div>
          </div>
        )
      })}
    </>
  )
}
