'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { createTag } from '@/actions/blog'
import { slugify } from '@/lib/utils'

export interface TagOption {
  id: string
  name: string
  slug: string
}

interface BlogTagInputProps {
  availableTags: TagOption[]
  selectedTagIds: string[]
  onChange: (nextTagIds: string[]) => void
  onTagsUpdate: (nextTags: TagOption[]) => void
}

export default function BlogTagInput({
  availableTags,
  selectedTagIds,
  onChange,
  onTagsUpdate,
}: BlogTagInputProps) {
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const selectedTags = useMemo(
    () => availableTags.filter((tag) => selectedTagIds.includes(tag.id)),
    [availableTags, selectedTagIds]
  )

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return []
    return availableTags
      .filter((tag) => !selectedTagIds.includes(tag.id))
      .filter((tag) => tag.name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [availableTags, selectedTagIds, value])

  const addExisting = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) return
    onChange([...selectedTagIds, tagId])
    setValue('')
  }

  const removeTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId))
  }

  const createAndAddTag = (name: string) => {
    const cleanName = name.trim()
    if (!cleanName) return

    const slug = slugify(cleanName)
    if (!slug) return

    const existing = availableTags.find((tag) => tag.slug === slug)
    if (existing) {
      addExisting(existing.id)
      return
    }

    startTransition(async () => {
      const result = await createTag(cleanName, slug)
      if (!result.success || !result.data) {
        toast.error(result.error || 'Nao foi possivel criar tag.')
        return
      }

      const created = result.data
      onTagsUpdate([...availableTags, created])
      onChange([...selectedTagIds, created.id])
      setValue('')
      toast.success('Tag criada.')
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="text-cyan-400 hover:text-white"
              aria-label={`Remover ${tag.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              createAndAddTag(value)
            }
          }}
          placeholder="Adicionar tag + Enter"
          className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e4e4e7] outline-none focus:border-cyan-500/50"
          disabled={isPending}
        />

        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-[#1e1e2a] bg-[#111118] p-1 shadow-lg">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addExisting(tag.id)}
                className="w-full rounded-md px-2 py-1.5 text-left text-xs text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#e4e4e7]"
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
