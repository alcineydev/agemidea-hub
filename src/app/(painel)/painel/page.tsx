import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PainelPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-2">Olá, {profile.name.split(' ')[0]}! 👋</h1>
      <p className="text-gray-500 mb-8">
        {profile.role === 'admin' ? 'Painel Administrativo' : 'Meu Painel'} — Dashboard em construção
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#0a0f1e] border border-[#1e3a5f]/30 rounded-xl p-6 h-32" />
        ))}
      </div>
    </div>
  )
}
