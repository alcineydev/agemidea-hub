import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center tech-grid">
      <div className="text-center animate-fade-in">
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-2">Página não encontrada</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
        >
          ← Voltar para o início
        </Link>
      </div>
    </div>
  )
}
