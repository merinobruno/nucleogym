'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { normalize } from '@/lib/capFirst'

type Socio = {
  id: string
  nombre: string
  dni: string
  activo: boolean
  created_at: string
}

type Filtro = 'activos' | 'inactivos' | 'todos'

function Avatar({ nombre }: { nombre: string }) {
  const parts = nombre.trim().split(' ')
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nombre.slice(0, 2).toUpperCase()

  return (
    <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold flex-shrink-0 select-none">
      {initials}
    </div>
  )
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

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
      const q = normalize(busqueda)
      return normalize(s.nombre).includes(q) || s.dni.includes(q)
    })

  const conteos = {
    activos: socios.filter(s => s.activo).length,
    inactivos: socios.filter(s => !s.activo).length,
    todos: socios.length,
  }

  const filtroLabels: { key: Filtro; label: string }[] = [
    { key: 'activos', label: 'Activos' },
    { key: 'inactivos', label: 'Inactivos' },
    { key: 'todos', label: 'Todos' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Gestión</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Socios
            <span className="ml-3 text-xl font-semibold text-gray-300">{socios.length}</span>
          </h1>
        </div>
        <Link
          href="/admin/socios/nuevo"
          className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          + Nuevo socio
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {filtroLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filtro === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs ${filtro === key ? 'text-gray-500' : 'text-gray-400'}`}>
                {conteos[key]}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:max-w-xs"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtrados.length === 0 ? (
            <p className="text-gray-400 text-sm p-8 text-center">No hay socios que coincidan.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">DNI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Ingreso</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nombre={s.nombre} />
                        <span className="font-semibold text-gray-900">{s.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.dni}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {formatFecha(s.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/socios/${s.id}`}
                        className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors"
                      >
                        Ver perfil →
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
