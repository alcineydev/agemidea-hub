export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen bg-gray-50"><aside className="w-64 bg-emerald-900 text-white p-4"><h2 className="text-lg font-bold">Meu Painel</h2></aside><main className="flex-1 p-8">{children}</main></div>
}
