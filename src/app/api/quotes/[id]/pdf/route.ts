import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RouteContext {
  params: Promise<{ id: string }>
}

function escapeHtml(input: string | null | undefined) {
  if (!input) return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, client:clients(*), items:quote_items(*)')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'quote_items', ascending: true })
    .single()

  if (!quote) {
    return NextResponse.json({ error: 'Orcamento nao encontrado' }, { status: 404 })
  }

  const { data: settings } = await supabase.from('quote_settings').select('*').limit(1).maybeSingle()
  const primary = settings?.primary_color || '#0ea5e9'
  const textColor = settings?.text_color || '#1e293b'
  const bgColor = settings?.bg_color || '#ffffff'
  const footer = settings?.footer_text || 'Documento gerado pelo Agemidea Hub.'
  const logo = settings?.logo_url || ''
  const logoAlign = settings?.logo_position === 'center' ? 'center' : settings?.logo_position === 'right' ? 'right' : 'left'
  const companyName = settings?.company_name || 'Sua empresa'
  const companyEmail = settings?.company_email || '-'
  const companyPhone = settings?.company_phone || '-'
  const companyAddress = settings?.company_address || '-'

  const itemsRows = (quote.items || [])
    .map(
      (item: {
        service_name: string
        description: string | null
        quantity: number
        unit_price: number
        discount_percent: number
        subtotal: number
      }, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.service_name)}</td>
        <td>${escapeHtml(item.description)}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(Number(item.unit_price))}</td>
        <td>${item.discount_percent}%</td>
        <td>${formatCurrency(Number(item.subtotal))}</td>
      </tr>
    `
    )
    .join('')

  const installmentsRows = (quote.payment_installments || [])
    .map(
      (item: { label: string; percent: number }) => `
      <li>${escapeHtml(item.label)} - ${item.percent}% (${formatCurrency((Number(quote.total) * item.percent) / 100)})</li>
    `
    )
    .join('')

  const html = `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Orcamento ${escapeHtml(quote.quote_number)}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; color: ${textColor}; }
    .page { max-width: 980px; margin: 0 auto; background: ${bgColor}; border: 1px solid #dce2ea; border-radius: 12px; overflow: hidden; }
    .header { padding: 20px; border-bottom: 2px solid ${primary}; text-align: ${logoAlign}; }
    .title { text-align: center; margin-top: 12px; }
    .title h1 { margin: 0; font-size: 22px; }
    .title p { margin: 4px 0 0; color: #64748b; }
    .body { padding: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .card { border: 1px solid #dce2ea; border-radius: 8px; padding: 12px; }
    .label { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
    th, td { border: 1px solid #dce2ea; padding: 8px; text-align: left; vertical-align: top; }
    th { background: ${primary}20; }
    .totals { margin-left: auto; width: 280px; border: 1px solid #dce2ea; border-radius: 8px; padding: 12px; }
    .totals p { display: flex; justify-content: space-between; margin: 6px 0; }
    .totals .grand { font-size: 22px; font-weight: 700; color: ${primary}; }
    .section { margin-top: 16px; }
    .section h3 { font-size: 13px; margin: 0 0 8px; }
    .footer { border-top: 1px solid #dce2ea; padding: 12px 20px; color: #64748b; font-size: 11px; }
    .print-actions { max-width: 980px; margin: 0 auto 10px; display: flex; justify-content: flex-end; gap: 8px; }
    .print-actions button { border: 1px solid #cbd5e1; background: white; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    @media print {
      body { background: white; padding: 0; }
      .print-actions { display: none; }
      .page { border: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>

  <article class="page">
    <header class="header">
      ${
        logo
          ? `<img src="${escapeHtml(logo)}" alt="Logo" style="max-width: 140px; height: auto;" />`
          : `<div style="display:inline-block;padding:6px 10px;border-radius:6px;background:${primary};color:white;font-size:12px;font-weight:700">LOGO</div>`
      }
      <div class="title">
        <h1>ORCAMENTO ${escapeHtml(quote.quote_number)}</h1>
        <p>Status: ${escapeHtml(quote.status)} | Validade: ${quote.valid_until ? formatDate(quote.valid_until) : '-'}</p>
      </div>
    </header>

    <div class="body">
      <div class="grid">
        <section class="card">
          <p class="label">De</p>
          <p><strong>${escapeHtml(companyName)}</strong></p>
          <p>${escapeHtml(companyEmail)}</p>
          <p>${escapeHtml(companyPhone)}</p>
          <p>${escapeHtml(companyAddress)}</p>
        </section>
        <section class="card">
          <p class="label">Para</p>
          <p><strong>${escapeHtml(quote.client?.name)}</strong></p>
          <p>${escapeHtml(quote.client?.email)}</p>
          <p>${escapeHtml(quote.client?.document)}</p>
          <p>${escapeHtml(quote.client?.phone)}</p>
        </section>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Servico</th>
            <th>Descricao</th>
            <th>Qtd</th>
            <th>Valor</th>
            <th>Desc.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <section class="totals">
        <p><span>Subtotal</span><strong>${formatCurrency(Number(quote.subtotal))}</strong></p>
        <p><span>Descontos</span><strong>- ${formatCurrency(Number(quote.discount_total))}</strong></p>
        <p class="grand"><span>Total</span><strong>${formatCurrency(Number(quote.total))}</strong></p>
      </section>

      <section class="section">
        <h3>Observacoes</h3>
        <p>${escapeHtml(quote.observation) || 'Sem observacoes.'}</p>
      </section>

      <section class="section">
        <h3>Termos e condicoes</h3>
        <p>${escapeHtml(quote.terms) || 'Sem termos adicionais.'}</p>
      </section>

      <section class="section">
        <h3>Condicoes de pagamento</h3>
        <ul>${installmentsRows || '<li>Sem parcelas definidas</li>'}</ul>
      </section>
    </div>

    <footer class="footer">${escapeHtml(footer)}</footer>
  </article>
</body>
</html>
`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${quote.quote_number}.html"`,
      'Cache-Control': 'no-store',
    },
  })
}
