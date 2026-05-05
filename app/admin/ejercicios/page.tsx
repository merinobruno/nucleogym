'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Ejercicio = {
  id: string
  nombre: string
  descripcion: string | null
  eliminado: boolean
}

type Tab = 'activos' | 'papelera'

function DumbbellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M6 9h12M6 15h12M3 7h3M18 7h3M3 17h3M18 17h3"/>
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function LibraryCard({ ejercicio, onEliminar }: { ejercicio: Ejercicio; onEliminar: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
          <DumbbellIcon />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{ejercicio.nombre}</h3>
          {ejercicio.descripcion && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{ejercicio.descripcion}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <Link
          href={`/admin/ejercicios/${ejercicio.id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <EditIcon />
          Editar
        </Link>
        <button
          onClick={onEliminar}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors ml-auto"
        >
          <TrashIcon />
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default function EjerciciosPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('activos')

  useEffect(() => {
    fetchEjercicios()
  }, [])

  async function fetchEjercicios() {
    const supabase = createClient()
    const { data } = await supabase
      .from('ejercicios')
      .select('id, nombre, descripcion, eliminado')
      .order('nombre')
    setEjercicios(data ?? [])
    setLoading(false)
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este ejercicio? Va a quedar marcado como ELIMINADO en las rutinas existentes.')) return
    const supabase = createClient()
    await supabase.from('ejercicios').update({ eliminado: true }).eq('id', id)
    setEjercicios(prev => prev.map(e => e.id === id ? { ...e, eliminado: true } : e))
    setTab('papelera')
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
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Biblioteca</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Ejercicios
            <span className="ml-3 text-xl font-semibold text-gray-300">{activos.length}</span>
          </h1>
        </div>
        <Link
          href="/admin/ejercicios/nuevo"
          className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          + Nuevo ejercicio
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('activos')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'activos'
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Activos
          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
            tab === 'activos' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {activos.length}
          </span>
        </button>
        <button
          onClick={() => setTab('papelera')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'papelera'
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Papelera
          {eliminados.length > 0 && (
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              tab === 'papelera' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {eliminados.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : tab === 'activos' ? (
        activos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-4">
              <DumbbellIcon />
            </div>
            <p className="text-gray-400 text-sm">No hay ejercicios cargados.</p>
            <Link href="/admin/ejercicios/nuevo" className="text-green-600 text-sm font-medium mt-2 inline-block hover:text-green-700">
              Agregar el primero →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {activos.map(e => (
              <LibraryCard key={e.id} ejercicio={e} onEliminar={() => handleEliminar(e.id)} />
            ))}
          </div>
        )
      ) : (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-sm text-amber-800">
              Los ejercicios eliminados siguen apareciendo como <strong>ELIMINADO</strong> en las rutinas de los socios. Restauralos si querés volver a usarlos.
            </p>
          </div>

          {eliminados.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">La papelera está vacía.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {eliminados.map((e, i) => (
                <div key={e.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center flex-shrink-0">
                    <DumbbellIcon />
                  </div>
                  <span className="flex-1 text-sm text-gray-400 line-through">{e.nombre}</span>
                  <button
                    onClick={() => handleRestaurar(e.id)}
                    className="text-xs font-medium text-gray-500 hover:text-green-600 transition-colors"
                  >
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
