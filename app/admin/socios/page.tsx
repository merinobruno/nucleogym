'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Socio = {
  id: string
  nombre: string
  dni: string
  activo: boolean
  created_at: string
}

type Filtro = 'todos' | 'activos' | 'inactivos'

export default function SociosPage() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [filtro, setFiltro] = useState<Filtro>('activos')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSocios()
  }, [])

  async function fetchSocios() {
    const supabase = createClient()
    const { data } = await supabase
      .from('socios')
      .select('id, nombre, dni, activo, created_at')
      .order('nombre')
    setSocios(data ?? [])
    setLoading(false)
  }

  const filtrados = socios
    .filter(s => {
      if (filtro === 'activos') return s.activo
      if (filtro === 'inactivos') return !s.activo
      return true
    })
    .filter(s => {
      if (!busqueda.trim()) return true
      const q = busqueda.toLowerCase()
      return s.nombre.toLowerCase().includes(q) || s.dni.includes(q)
    })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Socios</h1>
        <Link
          href="/admin/socios/nuevo"
          className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          + Nuevo socio
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['activos', 'inactivos', 'todos'] as Filtro[]).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                filtro === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:max-w-xs"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filtrados.length === 0 ? (
            <p className="text-gray-500 text-sm p-6">No hay socios que coincidan.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">DNI</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{s.dni}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/socios/${s.id}`}
                        className="text-gray-700 hover:text-green-600 underline"
                      >
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
