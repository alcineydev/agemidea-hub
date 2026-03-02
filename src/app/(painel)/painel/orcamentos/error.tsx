'use client'

export default function OrcamentosError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-lg font-semibold text-red-500">Erro ao carregar orcamentos</div>
      <p className="max-w-md text-center text-sm text-gray-400">
        {error.message || 'Ocorreu um erro inesperado. Verifique a conexao com o banco de dados.'}
      </p>
      {error.digest && <p className="font-mono text-xs text-gray-500">Digest: {error.digest}</p>}
      <button
        onClick={reset}
        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm text-white transition-colors hover:bg-cyan-600"
      >
        Tentar novamente
      </button>
    </div>
  )
}
