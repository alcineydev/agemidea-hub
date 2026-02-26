export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen bg-gray-50"><aside className="w-64 bg-gray-900 text-white p-4"><h2 className="text-lg font-bold">Admin</h2></aside><main className="flex-1 p-8">{children}</main></div>
}
