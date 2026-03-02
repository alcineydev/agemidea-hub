'use server'

import { revalidatePath } from 'next/cache'

import { createAdminClient, createServerClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/quotes'
import type { Client, ClientInsert } from '@/types/quotes'

export interface ClientAdminListItem extends Client {
  panel_enabled: boolean
  panel_active: boolean
  panel_user_id: string | null
  source_tag: 'orcamento' | 'painel'
}

function emptyToNull(value: string | null | undefined) {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeClientPayload(input: Record<string, unknown>) {
  return {
    ...input,
    trade_name: emptyToNull(input.trade_name as string | null | undefined),
    document: emptyToNull(input.document as string | null | undefined),
    email: emptyToNull(input.email as string | null | undefined)?.toLowerCase() ?? null,
    phone: emptyToNull(input.phone as string | null | undefined),
    whatsapp: emptyToNull(input.whatsapp as string | null | undefined),
    address_street: emptyToNull(input.address_street as string | null | undefined),
    address_number: emptyToNull(input.address_number as string | null | undefined),
    address_complement: emptyToNull(input.address_complement as string | null | undefined),
    address_neighborhood: emptyToNull(input.address_neighborhood as string | null | undefined),
    address_city: emptyToNull(input.address_city as string | null | undefined),
    address_state: emptyToNull(input.address_state as string | null | undefined),
    address_zip: emptyToNull(input.address_zip as string | null | undefined),
    notes: emptyToNull(input.notes as string | null | undefined),
  }
}

async function ensureAdminOrThrow() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) throw new Error('Nao autenticado')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') throw new Error('Nao autorizado')
  return { userId: user.id }
}

function mapClientsWithPanel(
  clients: Client[],
  profiles: Array<{ user_id: string; email: string; is_active: boolean }>
) {
  const profileByEmail = new Map<string, { user_id: string; is_active: boolean }>()
  for (const profile of profiles) {
    profileByEmail.set(profile.email.toLowerCase(), {
      user_id: profile.user_id,
      is_active: Boolean(profile.is_active),
    })
  }

  return clients.map((client) => {
    const email = client.email?.toLowerCase() ?? ''
    const panelProfile = email ? profileByEmail.get(email) : null
    const panelEnabled = Boolean(panelProfile?.user_id)

    return {
      ...client,
      panel_enabled: panelEnabled,
      panel_active: Boolean(panelProfile?.is_active),
      panel_user_id: panelProfile?.user_id ?? null,
      source_tag: panelEnabled ? 'painel' : 'orcamento',
    } satisfies ClientAdminListItem
  })
}

export async function listAdminClients(search?: string) {
  await ensureAdminOrThrow()
  const admin = createAdminClient()

  let query = admin.from('clients').select('*').order('created_at', { ascending: false })
  if (search?.trim()) {
    const s = search.trim()
    query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,document.ilike.%${s}%`)
  }

  const { data: clients, error: clientsError } = await query
  if (clientsError || !clients) {
    console.error('Erro ao listar clientes:', clientsError)
    return [] as ClientAdminListItem[]
  }

  const emails = Array.from(
    new Set(
      clients
        .map((client) => client.email?.toLowerCase())
        .filter((email): email is string => Boolean(email))
    )
  )

  let profiles: Array<{ user_id: string; email: string; is_active: boolean }> = []
  if (emails.length > 0) {
    const { data: profileRows } = await admin
      .from('profiles')
      .select('user_id, email, is_active')
      .eq('role', 'client')
      .in('email', emails)

    profiles = (profileRows ?? []) as Array<{ user_id: string; email: string; is_active: boolean }>
  }

  return mapClientsWithPanel(clients as Client[], profiles)
}

export async function getAdminClientById(id: string) {
  await ensureAdminOrThrow()
  const admin = createAdminClient()

  const { data: client, error } = await admin.from('clients').select('*').eq('id', id).single()
  if (error || !client) {
    console.error('Erro ao buscar cliente:', error)
    return null
  }

  const email = client.email?.toLowerCase()
  if (!email) {
    return {
      ...(client as Client),
      panel_enabled: false,
      panel_active: false,
      panel_user_id: null,
      source_tag: 'orcamento',
    } satisfies ClientAdminListItem
  }

  const { data: profileRow } = await admin
    .from('profiles')
    .select('user_id, email, is_active')
    .eq('role', 'client')
    .eq('email', email)
    .maybeSingle()

  const mapped = mapClientsWithPanel([client as Client], profileRow ? [profileRow] : [])
  return mapped[0] ?? null
}

export async function createAdminClientRecord(formData: ClientInsert) {
  const { userId } = await ensureAdminOrThrow()
  const parsed = clientSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const admin = createAdminClient()
  const payload = normalizeClientPayload(parsed.data)

  const { data, error } = await admin
    .from('clients')
    .insert({
      ...payload,
      created_by: userId,
    })
    .select()
    .single()

  if (error || !data) return { error: error?.message ?? 'Nao foi possivel criar o cliente' }

  revalidatePath('/painel/clientes')
  revalidatePath('/painel/orcamentos/novo')
  return { data: data as Client }
}

export async function updateAdminClientRecord(id: string, formData: Partial<ClientInsert>) {
  await ensureAdminOrThrow()
  const parsed = clientSchema.partial().safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const admin = createAdminClient()
  const payload = normalizeClientPayload(parsed.data)

  const { data, error } = await admin
    .from('clients')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return { error: error?.message ?? 'Nao foi possivel atualizar o cliente' }

  revalidatePath('/painel/clientes')
  revalidatePath(`/painel/clientes/${id}`)
  revalidatePath('/painel/orcamentos/novo')
  return { data: data as Client }
}

export async function deleteAdminClientRecord(id: string) {
  await ensureAdminOrThrow()
  const admin = createAdminClient()
  const { error } = await admin.from('clients').delete().eq('id', id)

  if (error) {
    return {
      error:
        error.message.includes('violates foreign key constraint') ||
        error.message.includes('quote')
          ? 'Este cliente possui orcamentos vinculados e nao pode ser excluido.'
          : error.message,
    }
  }

  revalidatePath('/painel/clientes')
  revalidatePath('/painel/orcamentos/novo')
  return { success: true }
}

export async function enableClientPanel(clientId: string, password: string) {
  await ensureAdminOrThrow()
  const admin = createAdminClient()

  if (!password || password.length < 6) {
    return { error: 'A senha deve ter no minimo 6 caracteres.' }
  }

  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (clientError || !client) return { error: 'Cliente nao encontrado.' }
  if (!client.email) return { error: 'Cliente sem email. Informe um email para liberar painel.' }

  const email = client.email.toLowerCase()

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, user_id, is_active')
    .eq('role', 'client')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile?.user_id) {
    await admin.from('profiles').update({ is_active: true }).eq('id', existingProfile.id)
    revalidatePath('/painel/clientes')
    revalidatePath(`/painel/clientes/${clientId}`)
    return { success: true }
  }

  const { data: authUserData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: client.name,
    },
  })

  if (authError || !authUserData.user) {
    return { error: authError?.message ?? 'Nao foi possivel criar usuario no painel.' }
  }

  const { error: profileError } = await admin.from('profiles').insert({
    user_id: authUserData.user.id,
    email,
    name: client.name,
    phone: client.phone ?? null,
    company: client.trade_name ?? null,
    role: 'client',
    is_active: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authUserData.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/painel/clientes')
  revalidatePath(`/painel/clientes/${clientId}`)
  return { success: true }
}

export async function disableClientPanel(clientId: string) {
  await ensureAdminOrThrow()
  const admin = createAdminClient()

  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('email')
    .eq('id', clientId)
    .single()

  if (clientError || !client?.email) return { error: 'Cliente sem painel para remover.' }

  const email = client.email.toLowerCase()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, user_id')
    .eq('role', 'client')
    .eq('email', email)
    .maybeSingle()

  if (!profile) return { success: true }

  const { error: profileDeleteError } = await admin.from('profiles').delete().eq('id', profile.id)
  if (profileDeleteError) return { error: profileDeleteError.message }

  if (profile.user_id) {
    const { error: userDeleteError } = await admin.auth.admin.deleteUser(profile.user_id)
    if (userDeleteError && !userDeleteError.message.toLowerCase().includes('not found')) {
      return { error: userDeleteError.message }
    }
  }

  revalidatePath('/painel/clientes')
  revalidatePath(`/painel/clientes/${clientId}`)
  return { success: true }
}

export async function resetClientPanelPassword(clientId: string, newPassword: string) {
  await ensureAdminOrThrow()
  const admin = createAdminClient()

  if (!newPassword || newPassword.length < 6) {
    return { error: 'A senha deve ter no minimo 6 caracteres.' }
  }

  const { data: client } = await admin.from('clients').select('email').eq('id', clientId).single()
  if (!client?.email) return { error: 'Cliente sem email de painel.' }

  const { data: profile } = await admin
    .from('profiles')
    .select('user_id')
    .eq('role', 'client')
    .eq('email', client.email.toLowerCase())
    .maybeSingle()

  if (!profile?.user_id) return { error: 'Painel nao encontrado para este cliente.' }

  const { error } = await admin.auth.admin.updateUserById(profile.user_id, {
    password: newPassword,
  })

  if (error) return { error: error.message }
  return { success: true }
}
