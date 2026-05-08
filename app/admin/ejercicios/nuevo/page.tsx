'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getYouTubeId, getYouTubeThumbnail } from '@/lib/youtube'

const MUSCLE_TAGS = [
  'Abdominales', 'Core', 'Pecho', 'Espalda', 'Hombros',
  'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquiotibiales',
  'Glúteos', 'Pantorrillas', 'Cardio', 'Cuerpo completo',
]

export default function NuevoEjercicioPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('ejercicios').insert({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      imagen_url: imagenUrl.trim() || null,
      tags,
    })

    if (error) {
      setError('Error al guardar. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/admin/ejercicios')
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          ← Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">Nuevo ejercicio</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            autoFocus
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grupos musculares</label>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_TAGS.map(tag => {
              const active = tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video de YouTube</label>
          <input
            type="url"
            value={imagenUrl}
            onChange={e => setImagenUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {imagenUrl && getYouTubeId(imagenUrl) && (
            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 relative" style={{ paddingTop: '30%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getYouTubeThumbnail(imagenUrl)!}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            </div>
          )}
          {imagenUrl && !getYouTubeId(imagenUrl) && (
            <p className="text-xs text-amber-600 mt-1">La URL no parece ser un link de YouTube válido.</p>
          )}
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
            className="text-sm px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
