import { formatCurrency } from '@/lib/utils'
import type { QuoteSettings } from '@/types/quotes'

interface QuotePdfPreviewProps {
  settings: Partial<QuoteSettings>
}

export default function QuotePdfPreview({ settings }: QuotePdfPreviewProps) {
  const primary = settings.primary_color || '#0ea5e9'
  const textColor = settings.text_color || '#1e293b'
  const background = settings.bg_color || '#ffffff'
  const logoSizeMap: Record<string, number> = { small: 64, medium: 96, large: 132 }
  const logoWidth = logoSizeMap[settings.logo_size ?? 'medium'] ?? 96
  const logoAlignMap: Record<string, 'flex-start' | 'center' | 'flex-end'> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }
  const logoJustify = logoAlignMap[settings.logo_position ?? 'left'] ?? 'flex-start'

  return (
    <div className="rounded-xl border border-[#1e3a5f]/25 bg-[#0a0f1e] p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Preview PDF</h3>
      <div className="rounded-lg border border-[#1e3a5f]/20 bg-white p-3">
        <article
          style={{ backgroundColor: background, color: textColor }}
          className="mx-auto w-full max-w-[320px] overflow-hidden rounded border border-slate-200 shadow-sm"
        >
          <header
            className="px-3 py-2"
            style={{
              borderBottom: `2px solid ${primary}`,
            }}
          >
            <div className="flex" style={{ justifyContent: logoJustify }}>
              {settings.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_url} alt="Logo" style={{ width: `${logoWidth}px`, height: 'auto' }} />
              ) : (
                <div
                  className="rounded px-2 py-1 text-[10px] font-bold"
                  style={{ backgroundColor: primary, color: '#ffffff' }}
                >
                  LOGO
                </div>
              )}
            </div>
            <div className="mt-2 text-center">
              <p className="text-[9px] tracking-wide text-slate-500">ORCAMENTO</p>
              <p className="text-xs font-bold">ORC-2026-001</p>
            </div>
          </header>

          <section className="space-y-2 p-3 text-[10px]">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-slate-200 p-2">
                <p className="font-semibold text-slate-500">De</p>
                <p className="font-semibold">{settings.company_name || 'Sua empresa'}</p>
                <p>{settings.company_email || 'contato@empresa.com'}</p>
              </div>
              <div className="rounded border border-slate-200 p-2">
                <p className="font-semibold text-slate-500">Para</p>
                <p className="font-semibold">Cliente Exemplo</p>
                <p>cliente@email.com</p>
              </div>
            </div>

            <div className="rounded border border-slate-200">
              <table className="w-full text-left text-[9px]">
                <thead style={{ backgroundColor: `${primary}15` }}>
                  <tr>
                    <th className="px-2 py-1">Servico</th>
                    <th className="px-2 py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1">Website institucional</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(4800)}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1">Landing page</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(2200)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded border border-slate-200 p-2">
              <p className="text-right text-[9px] text-slate-500">TOTAL</p>
              <p className="text-right text-sm font-bold" style={{ color: primary }}>
                {formatCurrency(7000)}
              </p>
            </div>
          </section>

          <footer className="border-t border-slate-200 px-3 py-2 text-[9px] text-slate-500">
            {settings.footer_text || 'Obrigado pela oportunidade.'}
          </footer>
        </article>
      </div>
    </div>
  )
}
