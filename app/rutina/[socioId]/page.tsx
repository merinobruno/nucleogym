'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Ejercicio = {
  id: string
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  eliminado: boolean
}

type FilaRutina = {
  id: string
  ejercicio_id: string | null
  series: number | null
  repeticiones: number | null
  nota: string | null
  orden: number
  ejercicio: Ejercicio | null
}

export default function RutinaPage() {
  const router = useRouter()
  const { socioId } = useParams<{ socioId: string }>()
  const [nombre, setNombre] = useState('')
  const [dias, setDias] = useState<number[]>([])
  const [diaActivo, setDiaActivo] = useState<number>(1)
  const [filas, setFilas] = useState<Record<number, FilaRutina[]>>({})
  const [seleccionada, setSeleccionada] = useState<FilaRutina | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedId = localStorage.getItem('nucleogym_socio')
    if (storedId !== socioId) {
      router.replace('/')
      return
    }
    loadData()
  }, [socioId])

  async function loadData() {
    const supabase = createClient()

    const [{ data: socioData }, { data: rutinaData }] = await Promise.all([
      supabase.from('socios').select('nombre').eq('id', socioId).single(),
      supabase
        .from('rutina_ejercicios')
        .select('*, ejercicios(id, nombre, descripcion, imagen_url, eliminado)')
        .eq('socio_id', socioId)
        .order('dia')
        .order('orden'),
    ])

    if (socioData) setNombre(socioData.nombre)

    if (rutinaData) {
      const grouped: Record<number, FilaRutina[]> = {}
      const diasSet = new Set<number>()

      for (const row of rutinaData) {
        diasSet.add(row.dia)
        if (!grouped[row.dia]) grouped[row.dia] = []
        grouped[row.dia].push({
          id: row.id,
          ejercicio_id: row.ejercicio_id,
          series: row.series,
          repeticiones: row.repeticiones,
          nota: row.nota,
          orden: row.orden,
          ejercicio: row.ejercicios as Ejercicio | null,
        })
      }

      const sortedDias = Array.from(diasSet).sort((a, b) => a - b)
      setDias(sortedDias)
      if (sortedDias.length > 0) setDiaActivo(sortedDias[0])
      setFilas(grouped)
    }

    setLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem('nucleogym_socio')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando tu rutina...</p>
      </div>
    )
  }

  // Vista detalle de un ejercicio
  if (seleccionada) {
    const ej = seleccionada.ejercicio
    const eliminado = ej?.eliminado ?? seleccionada.ejercicio_id === null

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setSeleccionada(null)}
            className="text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            ← Volver
          </button>

          {eliminado && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-600 text-sm font-medium">
                Este ejercicio fue eliminado de la biblioteca. Consultá con tu entrenador.
              </p>
            </div>
          )}

          {ej?.imagen_url && !eliminado && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ej.imagen_url}
              alt={ej.nombre}
              className="w-full rounded-xl object-cover mb-4 max-h-52"
            />
          )}

          <h1 className={`text-2xl font-bold mb-5 ${eliminado ? 'text-red-500 line-through' : 'text-gray-900'}`}>
            {ej?.nombre ?? 'Ejercicio eliminado'}
          </h1>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{seleccionada.series ?? '—'}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Series</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{seleccionada.repeticiones ?? '—'}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Repeticiones</p>
            </div>
          </div>

          {seleccionada.nota && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                Nota del entrenador
              </p>
              <p className="text-gray-900 text-sm">{seleccionada.nota}</p>
            </div>
          )}

          {ej?.descripcion && !eliminado && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Descripción
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">{ej.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Vista principal: lista de días y ejercicios
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Núcleo Gimnasio" className="w-10 h-10 object-contain flex-shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{nombre}</h1>
              <p className="text-sm text-gray-500">Tu rutina</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Salir
          </button>
        </div>

        {dias.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">Tu entrenador todavía no cargó tu rutina.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              {dias.map(dia => (
                <button
                  key={dia}
                  onClick={() => setDiaActivo(dia)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    diaActivo === dia
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Día {dia}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {(filas[diaActivo] ?? []).map((fila, idx) => {
                const eliminado = fila.ejercicio?.eliminado ?? fila.ejercicio_id === null
                const resumen = [
                  fila.series ? `${fila.series} series` : '',
                  fila.repeticiones ? `${fila.repeticiones} reps` : '',
                ].filter(Boolean).join(' × ') || 'Ver detalle'

                return (
                  <button
                    key={fila.id}
                    onClick={() => setSeleccionada(fila)}
                    className={`w-full text-left rounded-xl border p-4 flex items-center justify-between transition-colors active:scale-[0.99] ${
                      eliminado
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className={`font-medium text-sm ${eliminado ? 'text-red-500 line-through' : 'text-gray-900'}`}>
                          {fila.ejercicio?.nombre ?? 'Ejercicio eliminado'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{resumen}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xl">›</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
