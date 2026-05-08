'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { capFirst } from '@/lib/capFirst'

export default function NuevoSocioPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [clave, setClave] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('socios').insert({
      nombre: nombre.trim(),
      dni: dni.trim(),
      clave: clave.trim(),
    })

    if (error) {
      setError(error.code === '23505' ? 'Ya existe un socio con ese DNI.' : 'Error al guardar. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/admin/socios')
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          ← Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">Nuevo socio</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(capFirst(e.target.value))}
            autoCapitalize="sentences"
            required
            autoFocus
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
          <input
            type="text"
            value={dni}
            onChange={e => setDni(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clave *</label>
          <input
            type="text"
            value={clave}
            onChange={e => setClave(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">El socio usa esta clave para ver su rutina.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
