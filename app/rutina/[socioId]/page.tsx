'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useDarkMode } from '@/lib/useDarkMode'

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

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function RutinaPage() {
  const router = useRouter()
  const { socioId } = useParams<{ socioId: string }>()
  const { dark, toggle } = useDarkMode()
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

  const bg = dark ? 'bg-gray-900' : 'bg-gray-50'
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  const headingCls = dark ? 'text-white' : 'text-gray-900'
  const muted = dark ? 'text-gray-400' : 'text-gray-500'
  const tabInactive = dark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-700'
  const numCircle = dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
  const toggleCls = dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <p className={`text-sm ${muted}`}>Cargando tu rutina...</p>
      </div>
    )
  }

  // Vista detalle de un ejercicio
  if (seleccionada) {
    const ej = seleccionada.ejercicio
    const eliminado = ej?.eliminado ?? seleccionada.ejercicio_id === null

    return (
      <div className={`min-h-screen ${bg} transition-colors`}>
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSeleccionada(null)}
              className={`text-sm ${muted} hover:${headingCls}`}
            >
              ← Volver
            </button>
            <button
              onClick={toggle}
              className={`p-2 rounded-full transition-colors ${toggleCls}`}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {eliminado && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4">
              <p className="text-red-400 text-sm font-medium">
                Este ejercicio fue eliminado de la biblioteca. Consultá con tu entrenador.
              </p>
            </div>
          )}

          <h1 className={`text-2xl font-bold mb-5 ${eliminado ? 'text-red-500 line-through' : headingCls}`}>
            {ej?.nombre ?? 'Ejercicio eliminado'}
          </h1>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-xl border p-4 text-center ${card}`}>
              <p className={`text-3xl font-bold ${headingCls}`}>{seleccionada.series ?? '—'}</p>
              <p className={`text-xs uppercase tracking-wide mt-1 ${muted}`}>Series</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${card}`}>
              <p className={`text-3xl font-bold ${headingCls}`}>{seleccionada.repeticiones ?? '—'}</p>
              <p className={`text-xs uppercase tracking-wide mt-1 ${muted}`}>Repeticiones</p>
            </div>
          </div>

          {seleccionada.nota && (
            <div className={`rounded-xl p-4 mb-4 ${dark ? 'bg-amber-900/30 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${dark ? 'text-amber-400' : 'text-amber-700'}`}>
                Nota del entrenador
              </p>
              <p className={`text-sm ${headingCls}`}>{seleccionada.nota}</p>
            </div>
          )}

          {ej?.descripcion && !eliminado && (
            <div className={`rounded-xl border p-4 ${card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${muted}`}>
                Descripción
              </p>
              <p className={`text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{ej.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Vista principal: lista de días y ejercicios
  return (
    <div className={`min-h-screen ${bg} transition-colors`}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Núcleo Gimnasio" className="w-10 h-10 object-contain flex-shrink-0" />
            <div>
              <h1 className={`text-xl font-bold ${headingCls}`}>{nombre}</h1>
              <p className={`text-sm ${muted}`}>Tu rutina</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className={`p-2 rounded-full transition-colors ${toggleCls}`}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={handleLogout}
              className={`text-sm ${muted} hover:text-gray-800`}
            >
              Salir
            </button>
          </div>
        </div>

        {dias.length === 0 ? (
          <div className="text-center py-16">
            <p className={`text-sm ${muted}`}>Tu entrenador todavía no cargó tu rutina.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              {dias.map(dia => (
                <button
                  key={dia}
                  onClick={() => setDiaActivo(dia)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    diaActivo === dia ? 'bg-black text-white' : tabInactive
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
                        ? dark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                        : dark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 ${numCircle}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className={`font-medium text-sm ${eliminado ? 'text-red-500 line-through' : headingCls}`}>
                          {fila.ejercicio?.nombre ?? 'Ejercicio eliminado'}
                        </p>
                        <p className={`text-xs mt-0.5 ${muted}`}>{resumen}</p>
                      </div>
                    </div>
                    <span className={`text-xl ${muted}`}>›</span>
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
