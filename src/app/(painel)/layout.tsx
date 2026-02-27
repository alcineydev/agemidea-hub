import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DynamicFavicon } from '@/components/layout/DynamicFavicon'
import { PainelSidebar } from '@/components/layout/PainelSidebar'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#050510]">
      <DynamicFavicon />
      <PainelSidebar
        userName={profile.name}
        userRole={profile.role === 'admin' ? 'admin' : 'client'}
      />
      <main className="flex-1 relative z-[1] p-6 lg:p-8 lg:ml-[220px]">{children}</main>
    </div>
  )
}
