import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Testa leitura da tabela settings
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .limit(3)

    if (error) {
      return NextResponse.json(
        {
          status: 'ERROR',
          message: error.message,
          hint: 'Verifique se o SQL foi executado no Supabase',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Conexão com Supabase DEV funcionando!',
      settings_found: data?.length ?? 0,
      data,
    })
  } catch (err) {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: String(err),
      },
      { status: 500 }
    )
  }
}
