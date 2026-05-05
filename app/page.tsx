'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useDarkMode } from '@/lib/useDarkMode'

type Step = 'dni' | 'clave'

type Socio = {
  id: string
  nombre: string
  clave: string
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

export default function HomePage() {
  const router = useRouter()
  const { dark, toggle } = useDarkMode()
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

  const bg = dark ? 'bg-gray-900' : 'bg-gray-50'
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  const labelCls = dark ? 'text-gray-300' : 'text-gray-700'
  const inputCls = dark
    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:ring-white'
    : 'border-gray-300 text-gray-900 focus:ring-green-500'
  const muted = dark ? 'text-gray-400' : 'text-gray-500'
  const headingCls = dark ? 'text-white' : 'text-gray-900'
  const toggleCls = dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'

  return (
    <div className={`min-h-screen ${bg} flex flex-col items-center justify-center px-4 relative transition-colors`}>
      <button
        onClick={toggle}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${toggleCls}`}
        title={dark ? 'Modo claro' : 'Modo oscuro'}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Núcleo Gimnasio" className="mx-auto mb-3 w-24 h-24 object-contain" />
          <p className={`text-sm mt-1 ${muted}`}>Ingresá para ver tu rutina</p>
        </div>

        {step === 'dni' ? (
          <form onSubmit={handleDni} className={`rounded-xl border p-6 space-y-4 shadow-sm ${card}`}>
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelCls}`}>DNI</label>
              <input
                type="text"
                inputMode="numeric"
                value={dni}
                onChange={e => setDni(e.target.value)}
                required
                autoFocus
                placeholder="Ingresá tu DNI"
                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 ${inputCls}`}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium text-base hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Buscando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleClave} className={`rounded-xl border p-6 space-y-4 shadow-sm ${card}`}>
            <p className={`text-sm ${muted}`}>
              Hola, <span className={`font-semibold ${headingCls}`}>{socio?.nombre}</span>
            </p>
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelCls}`}>Clave</label>
              <input
                type="password"
                value={clave}
                onChange={e => setClave(e.target.value)}
                required
                autoFocus
                placeholder="Tu clave personal"
                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 ${inputCls}`}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium text-base hover:bg-green-700 transition-colors"
            >
              Ver mi rutina
            </button>
            <button
              type="button"
              onClick={() => { setStep('dni'); setError(''); setClave('') }}
              className={`w-full text-sm ${muted} hover:text-gray-800`}
            >
              ← Cambiar DNI
            </button>
          </form>
        )}
      </div>

      <p className={`mt-8 text-xs ${muted}`}>
        ¿Sos entrenador?{' '}
        <a href="/admin/login" className="underline hover:opacity-80">
          Accedé al panel
        </a>
      </p>
    </div>
  )
}
