'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { normalize } from '@/lib/capFirst'

const MUSCLE_TAGS = [
  'Abdominales', 'Core', 'Pecho', 'Espalda', 'Hombros',
  'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquiotibiales',
  'Glúteos', 'Pantorrillas', 'Cardio', 'Cuerpo completo',
]

type FilaRutina = {
  id: string
  ejercicio_id: string | null
  series: number | null
  repeticiones: number | null
  nota: string | null
  orden: number
  ejercicio: { nombre: string; eliminado: boolean } | null
}

type EjercicioLib = { id: string; nombre: string; tags: string[] }

type Props = { socioId: string }

export default function EditorRutina({ socioId }: Props) {
  const [dias, setDias] = useState<number[]>([])
  const [diaActivo, setDiaActivo] = useState<number>(1)
  const [filas, setFilas] = useState<Record<number, FilaRutina[]>>({})
  const [ejercicios, setEjercicios] = useState<EjercicioLib[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [tagsFiltro, setTagsFiltro] = useState<string[]>([])
  const [mostrarBuscador, setMostrarBuscador] = useState(false)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    loadRutina()
    loadEjercicios()
  }, [socioId])

  async function loadRutina() {
    const supabase = createClient()
    const { data } = await supabase
      .from('rutina_ejercicios')
      .select('*, ejercicios(nombre, eliminado)')
      .eq('socio_id', socioId)
      .order('dia')
      .order('orden')

    if (!data) { setLoading(false); return }

    const grouped: Record<number, FilaRutina[]> = {}
    const diasSet = new Set<number>()

    for (const row of data) {
      diasSet.add(row.dia)
      if (!grouped[row.dia]) grouped[row.dia] = []
      grouped[row.dia].push({
        id: row.id,
        ejercicio_id: row.ejercicio_id,
        series: row.series,
        repeticiones: row.repeticiones,
        nota: row.nota,
        orden: row.orden,
        ejercicio: row.ejercicios as { nombre: string; eliminado: boolean } | null,
      })
    }

    const sortedDias = Array.from(diasSet).sort((a, b) => a - b)
    setDias(sortedDias)
    if (sortedDias.length > 0) setDiaActivo(sortedDias[0])
    setFilas(grouped)
    setLoading(false)
  }

  async function loadEjercicios() {
    const supabase = createClient()
    const { data } = await supabase
      .from('ejercicios')
      .select('id, nombre, tags')
      .eq('eliminado', false)
      .order('nombre')
    setEjercicios((data ?? []).map(e => ({ ...e, tags: e.tags ?? [] })))
  }

  async function agregarDia() {
    const nuevoDia = dias.length > 0 ? Math.max(...dias) + 1 : 1
    setDias(prev => [...prev, nuevoDia])
    setFilas(prev => ({ ...prev, [nuevoDia]: [] }))
    setDiaActivo(nuevoDia)
  }

  async function eliminarDia(dia: number) {
    const supabase = createClient()
    await supabase.from('rutina_ejercicios').delete().eq('socio_id', socioId).eq('dia', dia)
    const diasRestantes = dias.filter(d => d !== dia)
    setDias(diasRestantes)
    setFilas(prev => {
      const next = { ...prev }
      delete next[dia]
      return next
    })
    if (diaActivo === dia) setDiaActivo(diasRestantes[0] ?? 1)
  }

  async function agregarEjercicio(ejercicioId: string) {
    const supabase = createClient()
    const filasDelDia = filas[diaActivo] ?? []
    const orden = filasDelDia.length

    const { data, error } = await supabase
      .from('rutina_ejercicios')
      .insert({ socio_id: socioId, dia: diaActivo, ejercicio_id: ejercicioId, orden })
      .select('*, ejercicios(nombre, eliminado)')
      .single()

    if (error || !data) return

    const nuevaFila: FilaRutina = {
      id: data.id,
      ejercicio_id: data.ejercicio_id,
      series: data.series,
      repeticiones: data.repeticiones,
      nota: data.nota,
      orden: data.orden,
      ejercicio: data.ejercicios as { nombre: string; eliminado: boolean } | null,
    }

    setFilas(prev => ({ ...prev, [diaActivo]: [...(prev[diaActivo] ?? []), nuevaFila] }))
    setBusqueda('')
    setMostrarBuscador(false)
    setTagsFiltro([])
  }

  async function eliminarFila(filaId: string) {
    const supabase = createClient()
    await supabase.from('rutina_ejercicios').delete().eq('id', filaId)
    setFilas(prev => ({
      ...prev,
      [diaActivo]: (prev[diaActivo] ?? []).filter(f => f.id !== filaId),
    }))
  }

  async function actualizarFila(filaId: string, campo: 'series' | 'repeticiones' | 'nota', valor: string) {
    const supabase = createClient()
    const parsed = campo === 'nota' ? valor || null : (valor === '' ? null : parseInt(valor))
    await supabase.from('rutina_ejercicios').update({ [campo]: parsed }).eq('id', filaId)
  }

  function handleCampoChange(filaId: string, campo: 'series' | 'repeticiones' | 'nota', valor: string) {
    setFilas(prev => ({
      ...prev,
      [diaActivo]: (prev[diaActivo] ?? []).map(f => {
        if (f.id !== filaId) return f
        if (campo === 'nota') return { ...f, nota: valor }
        return { ...f, [campo]: valor === '' ? null : parseInt(valor) }
      }),
    }))
    const key = `${filaId}-${campo}`
    clearTimeout(debounceRef.current[key])
    debounceRef.current[key] = setTimeout(() => actualizarFila(filaId, campo, valor), 600)
  }

  function handleCampoBlur(filaId: string, campo: 'series' | 'repeticiones' | 'nota', valor: string) {
    const key = `${filaId}-${campo}`
    clearTimeout(debounceRef.current[key])
    delete debounceRef.current[key]
    actualizarFila(filaId, campo, valor)
  }

  function toggleTag(tag: string) {
    setTagsFiltro(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const ejerciciosFiltrados = ejercicios.filter(e => {
    const matchNombre = normalize(e.nombre).includes(normalize(busqueda))
    const matchTags = tagsFiltro.length === 0 || tagsFiltro.some(t => e.tags.includes(t))
    return matchNombre && matchTags
  })

  if (loading) return <p className="text-gray-500 text-sm">Cargando rutina...</p>

  return (
    <div>
      {/* Tabs de días */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {dias.map(dia => (
          <div
            key={dia}
            className={`flex items-center gap-1 rounded-md text-sm font-medium transition-colors ${
              diaActivo === dia
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => { setDiaActivo(dia); setMostrarBuscador(false); setBusqueda(''); setTagsFiltro([]) }}
              className="px-4 py-2"
            >
              Día {dia}
            </button>
            <button
              onClick={() => eliminarDia(dia)}
              className="pr-2 leading-none hover:opacity-60 transition-opacity"
              title="Eliminar día"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={agregarDia}
          className="px-4 py-2 rounded-md text-sm font-medium bg-white border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          + Día
        </button>
      </div>

      {dias.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay días cargados. Agregá el primero con el botón + Día.</p>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <div className="bg-white rounded-t-lg overflow-hidden">
            {(filas[diaActivo] ?? []).length === 0 ? (
              <p className="text-gray-500 text-sm p-4">No hay ejercicios en este día.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Ejercicio</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Series</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 w-20">Reps</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Nota del entrenador</th>
                      <th className="px-4 py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(filas[diaActivo] ?? []).map(fila => {
                      const eliminado = fila.ejercicio?.eliminado ?? fila.ejercicio_id === null
                      return (
                        <tr key={fila.id} className={eliminado ? 'bg-red-50' : ''}>
                          <td className="px-4 py-2">
                            {eliminado ? (
                              <span className="text-red-500 line-through text-sm font-medium">
                                {fila.ejercicio?.nombre ?? 'Ejercicio eliminado'}
                              </span>
                            ) : (
                              <span className="text-gray-900 font-medium">{fila.ejercicio?.nombre}</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={fila.series !== null ? String(fila.series) : ''}
                              onChange={e => handleCampoChange(fila.id, 'series', e.target.value)}
                              onBlur={e => handleCampoBlur(fila.id, 'series', e.target.value)}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={fila.repeticiones !== null ? String(fila.repeticiones) : ''}
                              onChange={e => handleCampoChange(fila.id, 'repeticiones', e.target.value)}
                              onBlur={e => handleCampoBlur(fila.id, 'repeticiones', e.target.value)}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell">
                            <input
                              type="text"
                              value={fila.nota ?? ''}
                              onChange={e => handleCampoChange(fila.id, 'nota', e.target.value)}
                              onBlur={e => handleCampoBlur(fila.id, 'nota', e.target.value)}
                              placeholder="Nota para el socio..."
                              autoCapitalize="sentences"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => eliminarFila(fila.id)}
                              className="text-gray-400 hover:text-red-600 text-xl leading-none font-light"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Buscador con filtro de tags */}
          <div className="bg-white rounded-b-lg border-t border-gray-200 p-3 relative">
            {mostrarBuscador ? (
              <div>
                {/* Tag filter chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {MUSCLE_TAGS.map(tag => {
                    const active = tagsFiltro.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          active
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>

                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar ejercicio por nombre..."
                  autoFocus
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {ejerciciosFiltrados.length > 0 && (
                  <div className="absolute z-10 left-3 right-3 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                    {ejerciciosFiltrados.map(e => (
                      <button
                        key={e.id}
                        onClick={() => agregarEjercicio(e.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 flex items-start justify-between gap-4"
                      >
                        <span className="font-medium">{e.nombre}</span>
                        {e.tags.length > 0 && (
                          <span className="flex gap-1 flex-wrap justify-end flex-shrink-0">
                            {e.tags.slice(0, 3).map(t => (
                              <span key={t} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                                {t}
                              </span>
                            ))}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {(busqueda || tagsFiltro.length > 0) && ejerciciosFiltrados.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No se encontraron ejercicios.</p>
                )}

                <button
                  onClick={() => { setMostrarBuscador(false); setBusqueda(''); setTagsFiltro([]) }}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMostrarBuscador(true)}
                className="text-sm text-gray-700 hover:text-green-600 font-medium"
              >
                + Agregar ejercicio
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
