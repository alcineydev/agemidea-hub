import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Agemidea — Transformamos Empresas em Potências Digitais',
    template: '%s | Agemidea',
  },
  description:
    'Marketing estratégico, automações inteligentes e desenvolvimento de software sob medida.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://agemidea.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Agemidea',
  },
  robots: {
    index: process.env.NEXT_PUBLIC_APP_URL?.includes('vercel.app') ? false : true,
    follow: process.env.NEXT_PUBLIC_APP_URL?.includes('vercel.app') ? false : true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-[#050510] text-white min-h-screen">
        {children}
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: '#0a0f1e',
              border: '1px solid rgba(30, 58, 95, 0.4)',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
