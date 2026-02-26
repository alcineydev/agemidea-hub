'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ModelRecord } from '@/lib/actions/models'
import { ModelHtmlRenderer } from './ModelHtmlRenderer'

interface PopupRendererProps {
  popups: ModelRecord[]
}

declare global {
  interface Window {
    agOpenPopup?: (popupId: string) => void
  }
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

  useEffect(() => {
    if (visiblePopups.length > 0) {
      document.body.style.overflow = 'hidden'
      return
    }
    document.body.style.overflow = ''
  }, [visiblePopups])

  useEffect(() => {
    window.agOpenPopup = (popupId: string) => {
      const popupExists = popupMap.get(popupId)
      if (!popupExists) return
      setVisiblePopups((prev) => (prev.includes(popupId) ? prev : [...prev, popupId]))
    }

    const handleTriggerClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const trigger = target?.closest('.ag-trigger-popup')
      if (!trigger) return

      event.preventDefault()
      const popupId = trigger.getAttribute('data-popup-id')
      if (popupId && window.agOpenPopup) {
        window.agOpenPopup(popupId)
      }
    }

    document.addEventListener('click', handleTriggerClick)
    return () => {
      document.removeEventListener('click', handleTriggerClick)
      window.agOpenPopup = undefined
      document.body.style.overflow = ''
    }
  }, [popupMap])

  useEffect(() => {
    const handlePopupClose = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const container = target.closest('[data-ag-popup-id]')
      if (!container) return

      const popupId = container.getAttribute('data-ag-popup-id')
      if (!popupId) return

      setVisiblePopups((prev) => prev.filter((id) => id !== popupId))
    }

    document.addEventListener('ag-popup-close', handlePopupClose as EventListener)
    return () => document.removeEventListener('ag-popup-close', handlePopupClose as EventListener)
  }, [])

  return (
    <>
      {visiblePopups.map((popupId) => {
        const popup = popupMap.get(popupId)
        if (!popup) return null

        return (
          <div
            key={popup.id}
            data-ag-popup-id={popup.id}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
            }}
          >
            <ModelHtmlRenderer
              html={`${popup.css_content ? `<style>${popup.css_content}</style>` : ''}${popup.html_content || ''}${popup.js_content ? `<script>${popup.js_content}<\/script>` : ''}`}
              executeOnChangeKey={popup.id}
            />
          </div>
        )
      })}
    </>
  )
}
