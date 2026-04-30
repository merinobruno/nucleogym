'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'dni' | 'clave'

type Socio = {
  id: string
  nombre: string
  clave: string
}

export default function HomePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('dni')
  const [dni, setDni] = useState('')
  const [clave, setClave] = useState('')
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDni(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data } = await supabase
      .from('socios')
      .select('id, nombre, clave')
      .eq('dni', dni.trim())
      .eq('activo', true)
      .single()

    if (!data) {
      setError('No encontramos un socio activo con ese DNI.')
      setLoading(false)
      return
    }

    setSocio(data)
    setStep('clave')
    setLoading(false)
  }

  function handleClave(e: React.FormEvent) {
    e.preventDefault()
    if (!socio) return

    if (clave.trim() !== socio.clave) {
      setError('Clave incorrecta.')
      return
    }

    localStorage.setItem('nucleogym_socio', socio.id)
    router.push(`/rutina/${socio.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gimnasio Núcleo</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresá para ver tu rutina</p>
        </div>

        {step === 'dni' ? (
          <form onSubmit={handleDni} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input
                type="text"
                inputMode="numeric"
                value={dni}
                onChange={e => setDni(e.target.value)}
                required
                autoFocus
                placeholder="Ingresá tu DNI"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium text-base hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Buscando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleClave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Hola, <span className="font-semibold text-gray-900">{socio?.nombre}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
              <input
                type="password"
                value={clave}
                onChange={e => setClave(e.target.value)}
                required
                autoFocus
                placeholder="Tu clave personal"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-medium text-base hover:bg-gray-800 transition-colors"
            >
              Ver mi rutina
            </button>
            <button
              type="button"
              onClick={() => { setStep('dni'); setError(''); setClave('') }}
              className="w-full text-sm text-gray-500 hover:text-gray-800"
            >
              ← Cambiar DNI
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-xs text-gray-400">
        ¿Sos entrenador?{' '}
        <a href="/admin/login" className="underline hover:text-gray-600">
          Accedé al panel
        </a>
      </p>
    </div>
  )
}
