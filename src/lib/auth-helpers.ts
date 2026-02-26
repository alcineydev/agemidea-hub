'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function getAuthenticatedProfileId(): Promise<string> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Perfil do usuário não encontrado.')
  }

  return profile.id
}
