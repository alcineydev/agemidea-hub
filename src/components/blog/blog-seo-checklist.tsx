interface BlogSeoChecklistProps {
  title: string
  slug: string
  metaDescription: string
  focusKeyword: string
  content: string
  coverImageUrl: string
  coverImageAlt: string
}

export default function BlogSeoChecklist({
  title,
  slug,
  metaDescription,
  focusKeyword,
  content,
  coverImageUrl,
  coverImageAlt,
}: BlogSeoChecklistProps) {
  const normalizedKeyword = focusKeyword.trim().toLowerCase()
  const wordCount = content
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  const checks = [
    {
      label: 'Palavra-chave no titulo',
      ok: normalizedKeyword ? title.toLowerCase().includes(normalizedKeyword) : false,
    },
    {
      label: 'Palavra-chave no slug',
      ok: normalizedKeyword ? slug.toLowerCase().includes(normalizedKeyword) : false,
    },
    {
      label: 'Meta description preenchida',
      ok: metaDescription.trim().length > 0,
    },
    {
      label: 'Imagem de capa com alt text',
      ok: Boolean(coverImageUrl.trim() && coverImageAlt.trim()),
    },
    {
      label: 'Conteudo com +300 palavras',
      ok: wordCount >= 300,
    },
    {
      label: 'Heading tags (H2/H3) presentes',
      ok: /<h2|<h3|^##|^###/im.test(content),
    },
    {
      label: 'Links internos presentes',
      ok: /href=["'][^"']+["']/i.test(content),
    },
  ]

  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-2 text-xs">
          <span className={check.ok ? 'text-emerald-400' : 'text-[#71717a]'}>{check.ok ? '✅' : '⬜'}</span>
          <span className={check.ok ? 'text-[#e4e4e7]' : 'text-[#71717a]'}>{check.label}</span>
        </div>
      ))}
    </div>
  )
}
