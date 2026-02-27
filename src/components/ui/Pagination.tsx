'use client'

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  if (totalPages <= 1) return null

  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center gap-0.5">
      <button
        aria-label="Página anterior"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-8 h-8 rounded-lg border border-[#1e3a5f]/20 flex items-center justify-center text-slate-600 hover:text-slate-400 disabled:opacity-30 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg border text-[12px] font-medium flex items-center justify-center transition-all ${
            page === currentPage
              ? 'bg-cyan-500/8 border-cyan-500/20 text-cyan-400 font-semibold'
              : 'border-[#1e3a5f]/20 text-slate-600 hover:text-slate-400 hover:border-[#1e3a5f]/40'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        aria-label="Próxima página"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-8 h-8 rounded-lg border border-[#1e3a5f]/20 flex items-center justify-center text-slate-600 hover:text-slate-400 disabled:opacity-30 disabled:pointer-events-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <span className="text-[12px] text-slate-700 ml-3">
        {start}-{end} de {totalItems}
      </span>
    </div>
  )
}
