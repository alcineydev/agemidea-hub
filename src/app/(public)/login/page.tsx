'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, leadSchema, type LoginInput, type LeadInput } from '@/lib/validations'
import Link from 'next/link'
import { DynamicLogo } from '@/components/layout/DynamicLogo'

function LoginContent() {
  const [tab, setTab] = useState<'login' | 'interest'>('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const supabase = createClient()

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleLogin = async (data: LoginInput) => {
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          toast.error('Email ou senha incorretos')
        } else {
          toast.error(authError.message)
        }
        return
      }

      if (!authData.user) {
        toast.error('Erro ao fazer login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('user_id', authData.user.id)
        .single()

      if (profileError || !profile) {
        toast.error('Perfil não encontrado. Entre em contato com o suporte.')
        await supabase.auth.signOut()
        return
      }

      if (!profile.is_active) {
        toast.error('Sua conta está desativada. Entre em contato com o suporte.')
        await supabase.auth.signOut()
        return
      }

      toast.success('Login realizado com sucesso!')

      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/painel')
      }
      router.refresh()
    } catch {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const interestForm = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      service_interest: '',
    },
  })

  const handleInterest = async (data: LeadInput) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('leads').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        message: data.message || null,
        service_interest: data.service_interest || null,
        status: 'novo',
      })

      if (error) {
        toast.error('Erro ao enviar. Tente novamente.')
        return
      }

      toast.success('Interesse enviado com sucesso! Entraremos em contato em breve.')
      interestForm.reset()
      setTab('login')
    } catch {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = loginForm.getValues('email')
    if (!email) {
      toast.error('Digite seu email primeiro')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?tab=reset`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.')
    } catch {
      toast.error('Erro ao enviar email de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050510] flex">
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-[#050510]">
        <div className="absolute inset-0 tech-grid" />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/[0.05] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-400/[0.03] rounded-full blur-2xl" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <DynamicLogo
                imgClassName="h-12 w-auto object-contain"
                fallbackText="AGEMIDEA"
                fallbackBadge="HUB"
                showBadge
                showIconFallback
              />
            </Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 mb-6">
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-medium">
                Plataforma de Gestão
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white leading-[1.15] mb-5">
              Transformamos
              <br />
              Empresas em
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                Potências Digitais
              </span>
            </h1>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Marketing estratégico, automações inteligentes e desenvolvimento de software sob medida
              para escalar seu negócio.
            </p>
          </div>

          <div className="flex gap-6">
            {[
              { value: '+50', label: 'Empresas' },
              { value: 'R$5M+', label: 'Gerados' },
              { value: '+200', label: 'Automações' },
              { value: '98%', label: 'Satisfação' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-500">
                  {stat.value}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0f1e] flex flex-col justify-center px-6 lg:px-12 relative min-h-screen">
        <div className="absolute inset-0 dot-pattern" />

        <div className="lg:hidden pt-12 pb-6 relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-5">
            <DynamicLogo
              imgClassName="h-10 w-auto object-contain"
              fallbackText="AGEMIDEA"
              fallbackBadge="HUB"
              showBadge
              showIconFallback
            />
          </Link>
          <h1 className="text-xl font-bold text-white leading-tight">
            Transformamos Empresas em{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              Potências Digitais
            </span>
          </h1>
        </div>

        <div className="relative z-10 max-w-sm mx-auto w-full">
          <div className="flex gap-1 mb-8 bg-[#050510] rounded-xl p-1 border border-[#1e3a5f]/30">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setTab('interest')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'interest'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Tenho Interesse
            </button>
          </div>

          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">Bem-vindo de volta</h2>
              <p className="text-gray-500 text-sm mb-7">Acesse seu painel de gestão</p>

              <div className="mb-4">
                <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register('email')}
                  className="w-full bg-[#050510] border border-[#1e3a5f]/40 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    className="w-full bg-[#050510] border border-[#1e3a5f]/40 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right mb-7">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-6">
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-[11px] text-gray-600">Conexão segura e criptografada</span>
              </div>

              <div className="lg:hidden mt-8 flex justify-between bg-[#050510] border border-[#1e3a5f]/20 rounded-xl p-4">
                {[
                  { value: '+50', label: 'Empresas' },
                  { value: 'R$5M+', label: 'Gerados' },
                  { value: '98%', label: 'Satisfação' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-500">
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          )}

          {tab === 'interest' && (
            <form onSubmit={interestForm.handleSubmit(handleInterest)} className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">Tenho interesse</h2>
              <p className="text-gray-500 text-sm mb-6">Preencha e nossa equipe entrará em contato</p>

              <div className="mb-3.5">
                <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">
                  Nome completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  {...interestForm.register('name')}
                  className="w-full bg-[#050510] border border-[#1e3a5f]/40 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {interestForm.formState.errors.name && (
                  <p className="text-red-400 text-xs mt-1">{interestForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    {...interestForm.register('email')}
                    className="w-full bg-[#050510] border border-[#1e3a5f]/40 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  {interestForm.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1">{interestForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    {...interestForm.register('phone')}
                    className="w-full bg-[#050510] border border-[#1e3a5f]/40 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-3.5">
                <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">
                  Empresa <span className="text-gray-600 normal-case tracking-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome da empresa"
                  {...interestForm.register('company')}
                  className="w-full bg-[#050510] border border-[#1e3a5f]/40 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="mb-6">
                <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">
                  Interesse em
                </label>
                <select
                  {...interestForm.register('service_interest')}
                  className="w-full bg-[#050510] border border-[#1e3a5f]/40 rounded-xl px-4 py-3.5 text-sm text-gray-400 focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                  }}
                >
                  <option value="">Selecione o serviço</option>
                  <option value="marketing">Marketing Digital</option>
                  <option value="automacao">Automações Inteligentes</option>
                  <option value="desenvolvimento">Desenvolvimento de Software</option>
                  <option value="completo">Solução Completa</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar interesse'
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[11px] text-gray-600">
                  Isso não cria uma conta. Nossa equipe entrará em contato.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <svg className="animate-spin w-5 h-5 text-cyan-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-gray-400 text-sm">Carregando...</span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}
