import { createClient } from '@supabase/supabase-js'

// Banco PROD
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  console.log('Certifique-se de que .env.local tem as variáveis do banco PROD ou rode com as variáveis corretas.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  const email = 'adm@agemidea.com.br'

  console.log('🔍 Buscando usuário no Auth...')
  console.log(`   URL: ${supabaseUrl}`)

  // Listar usuários para encontrar o UUID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError.message)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.error(`❌ Usuário ${email} não encontrado no Auth!`)
    console.log('   Crie o usuário primeiro em: Supabase Dashboard → Authentication → Add User')
    process.exit(1)
  }

  console.log(`✅ Usuário encontrado!`)
  console.log(`   UUID: ${user.id}`)
  console.log(`   Email: ${user.email}`)

  // Verificar se já existe profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    console.log('⚠️  Profile já existe! Nada a fazer.')
    process.exit(0)
  }

  // Inserir profile
  console.log('📝 Criando profile admin...')
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      email: email,
      name: 'Admin Agemidea',
      role: 'admin',
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Erro ao criar profile:', error.message)
    // Se der erro de coluna, mostrar colunas disponíveis
    const { data: cols } = await supabase.rpc('', {}).catch(() => null)
    process.exit(1)
  }

  console.log('✅ Profile admin criado com sucesso!')
  console.log(`   ID: ${data.id}`)
  console.log(`   Role: ${data.role}`)
  console.log('')
  console.log('🎉 Agora teste o login em: https://agemidea.com.br/login')
}

main()
