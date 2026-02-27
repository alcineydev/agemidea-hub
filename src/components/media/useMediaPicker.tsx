'use client'

import { useCallback, useState } from 'react'

import { MediaPickerModal, type SelectedMedia } from './MediaPickerModal'

interface UseMediaPickerOptions {
  accept?: string[]
  maxSize?: number
  title?: string
}

export function useMediaPicker(options?: UseMediaPickerOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [resolve, setResolve] = useState<((file: SelectedMedia | null) => void) | null>(null)

  const openPicker = useCallback(() => {
    return new Promise<SelectedMedia | null>((res) => {
      setResolve(() => res)
      setIsOpen(true)
    })
  }, [])

  const handleSelect = useCallback(
    (file: SelectedMedia) => {
      resolve?.(file)
      setIsOpen(false)
      setResolve(null)
    },
    [resolve]
  )

  const handleClose = useCallback(() => {
    resolve?.(null)
    setIsOpen(false)
    setResolve(null)
  }, [resolve])

  const PickerModal = useCallback(
    () => (
      <MediaPickerModal
        isOpen={isOpen}
        onClose={handleClose}
        onSelect={handleSelect}
        accept={options?.accept}
        maxSize={options?.maxSize}
        title={options?.title}
      />
    ),
    [handleClose, handleSelect, isOpen, options?.accept, options?.maxSize, options?.title]
  )

  return { openPicker, PickerModal }
}
