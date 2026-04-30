'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Ejercicio = {
  id: string
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  eliminado: boolean
  created_at: string
}

export default function EjerciciosPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEjercicios()
  }, [])

  async function fetchEjercicios() {
    const supabase = createClient()
    const { data } = await supabase
      .from('ejercicios')
      .select('*')
      .order('nombre')
    setEjercicios(data ?? [])
    setLoading(false)
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este ejercicio? Va a quedar marcado como ELIMINADO en las rutinas existentes.')) return
    const supabase = createClient()
    await supabase.from('ejercicios').update({ eliminado: true }).eq('id', id)
    setEjercicios(prev => prev.map(e => e.id === id ? { ...e, eliminado: true } : e))
  }

  async function handleRestaurar(id: string) {
    const supabase = createClient()
    await supabase.from('ejercicios').update({ eliminado: false }).eq('id', id)
    setEjercicios(prev => prev.map(e => e.id === id ? { ...e, eliminado: false } : e))
  }

  const activos = ejercicios.filter(e => !e.eliminado)
  const eliminados = ejercicios.filter(e => e.eliminado)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Ejercicios</h1>
        <Link
          href="/admin/ejercicios/nuevo"
          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          + Nuevo ejercicio
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            {activos.length === 0 ? (
              <p className="text-gray-400 text-sm p-6">No hay ejercicios cargados.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Descripción</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activos.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{e.nombre}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                        {e.descripcion ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/admin/ejercicios/${e.id}`}
                          className="text-gray-500 hover:text-black"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleEliminar(e.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {eliminados.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">Eliminados</h2>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {eliminados.map(e => (
                      <tr key={e.id} className="bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 line-through">{e.nombre}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRestaurar(e.id)}
                            className="text-gray-400 hover:text-black text-sm"
                          >
                            Restaurar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
