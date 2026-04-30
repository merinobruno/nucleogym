'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import EditorRutina from '@/components/admin/EditorRutina'

type Socio = {
  id: string
  nombre: string
  dni: string
  clave: string
  activo: boolean
}

export default function DetalleSocioPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [socio, setSocio] = useState<Socio | null>(null)
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [clave, setClave] = useState('')
  const [activo, setActivo] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetchSocio() {
      const supabase = createClient()
      const { data } = await supabase.from('socios').select('*').eq('id', id).single()
      if (data) {
        setSocio(data)
        setNombre(data.nombre)
        setDni(data.dni)
        setClave(data.clave)
        setActivo(data.activo)
      }
      setLoading(false)
    }
    fetchSocio()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { error } = await supabase.from('socios').update({
      nombre: nombre.trim(),
      dni: dni.trim(),
      clave: clave.trim(),
      activo,
    }).eq('id', id)

    if (error) {
      setError(error.code === '23505' ? 'Ya existe un socio con ese DNI.' : 'Error al guardar.')
      setSaving(false)
      return
    }

    setSocio(prev => prev ? { ...prev, nombre: nombre.trim() } : prev)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <p className="text-gray-500 text-sm">Cargando...</p>
  if (!socio) return <p className="text-gray-500 text-sm">Socio no encontrado.</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          ← Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">{socio.nombre}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del socio */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Datos</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input
                type="text"
                value={dni}
                onChange={e => setDni(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
              <input
                type="text"
                value={clave}
                onChange={e => setClave(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActivo(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activo ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-gray-700">{activo ? 'Activo' : 'Inactivo'}</span>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              {saved && <span className="text-sm text-green-600">✓ Guardado</span>}
            </div>
          </form>
        </div>

        {/* Editor de rutina */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Rutina</h2>
          <EditorRutina socioId={id} />
        </div>
      </div>
    </div>
  )
}
