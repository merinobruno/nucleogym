import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { filaId, nota, socioId } = await request.json()

  if (!filaId || !socioId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar que la fila pertenece al socio antes de actualizar
  const { data, error: fetchError } = await supabase
    .from('rutina_ejercicios')
    .select('id')
    .eq('id', filaId)
    .eq('socio_id', socioId)
    .single()

  if (fetchError || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('rutina_ejercicios')
    .update({ nota_socio: nota || null })
    .eq('id', filaId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
