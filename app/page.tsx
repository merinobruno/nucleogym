'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useDarkMode } from '@/lib/useDarkMode'

type Socio = {
  id: string
  nombre: string
  clave: string
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function formatDni(digits: string) {
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
}

export default function HomePage() {
  const router = useRouter()
  const { dark, toggle } = useDarkMode()
  const [step, setStep] = useState<1 | 2>(1)
  const [rawDni, setRawDni] = useState('')
  const [clave, setClave] = useState('')
  const [socio, setSocio] = useState<Socio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleDniInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    setRawDni(digits)
    setError('')
  }

  async function handleNextStep() {
    setError('')
    if (rawDni.length < 7) {
      setError('Ingresá un DNI válido')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data } = await supabase
      .from('socios')
      .select('id, nombre, clave')
      .eq('dni', rawDni)
      .eq('activo', true)
      .single()

    if (!data) {
      setError('No encontramos un socio activo con ese DNI.')
      setLoading(false)
      return
    }

    setSocio(data)
    setStep(2)
    setClave('')
    setLoading(false)
  }

  function handleLogin() {
    setError('')
    if (!socio) return
    if (clave.length < 4) {
      setError('La clave es muy corta')
      return
    }
    if (clave.trim() !== socio.clave) {
      setError('Clave incorrecta.')
      return
    }
    localStorage.setItem('nucleogym_socio', socio.id)
    router.push(`/rutina/${socio.id}`)
  }

  const palette = dark
    ? { bg: '#0a0a0a', surface: '#171717', border: '#262626', text: '#fafafa', subtext: '#a3a3a3', inputBg: '#0a0a0a' }
    : { bg: '#fafafa', surface: '#ffffff', border: '#e5e5e5', text: '#0a0a0a', subtext: '#737373', inputBg: '#ffffff' }

  return (
    <div style={{
      minHeight: '100vh', background: palette.bg, color: palette.text,
      display: 'flex', flexDirection: 'column', position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Theme toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
        <button
          onClick={toggle}
          aria-label="Cambiar tema"
          style={{
            width: 40, height: 40, borderRadius: 999,
            background: dark ? '#171717' : '#ffffff',
            border: `1px solid ${palette.border}`,
            color: palette.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Centered card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px 32px' }}>
        <div style={{
          width: '100%', maxWidth: 360,
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 18,
          padding: '32px 24px 28px',
          boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Núcleo Gimnasio" style={{ width: 96, height: 96, objectFit: 'contain' }} />
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em', color: palette.text }}>
              Hola de nuevo
            </h1>
            <p style={{ fontSize: 14, color: palette.subtext, margin: 0 }}>
              {step === 1 ? 'Ingresá tu DNI para continuar' : 'Bienvenido. Ingresá tu clave'}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ width: 28, height: 3, borderRadius: 2, background: step >= 1 ? '#16a34a' : (dark ? '#262626' : '#e5e5e5') }} />
            <span style={{ width: 28, height: 3, borderRadius: 2, background: step >= 2 ? '#16a34a' : (dark ? '#262626' : '#e5e5e5') }} />
          </div>

          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: palette.subtext }}>
                DNI
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={formatDni(rawDni)}
                onChange={e => handleDniInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNextStep()}
                placeholder="00.000.000"
                style={{
                  height: 52, padding: '0 16px',
                  border: `1px solid ${error ? '#ef4444' : palette.border}`,
                  borderRadius: 10,
                  background: palette.inputBg, color: palette.text,
                  fontSize: 17, letterSpacing: '0.04em',
                  outline: 'none',
                  fontVariantNumeric: 'tabular-nums' as const,
                }}
              />
              {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</div>}
              <button
                onClick={handleNextStep}
                disabled={loading}
                style={{
                  marginTop: 16, width: '100%', height: 52, fontSize: 15,
                  background: '#16a34a', color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Buscando...' : <>Siguiente <ChevronRightIcon /></>}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { setStep(1); setError(''); setClave('') }}
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 500,
                  color: palette.subtext,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px 8px 4px 4px', marginLeft: -4, marginBottom: 6,
                  borderRadius: 6,
                }}
              >
                <ChevronLeftIcon />
                <span style={{ fontVariantNumeric: 'tabular-nums' as const }}>{formatDni(rawDni)}</span>
              </button>

              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: palette.subtext }}>
                Clave
              </label>
              <input
                type="password"
                autoFocus
                value={clave}
                onChange={e => { setClave(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••"
                style={{
                  height: 52, padding: '0 16px',
                  border: `1px solid ${error ? '#ef4444' : palette.border}`,
                  borderRadius: 10,
                  background: palette.inputBg, color: palette.text,
                  fontSize: 17, letterSpacing: '0.2em',
                  outline: 'none',
                }}
              />
              {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</div>}
              <button
                onClick={handleLogin}
                style={{
                  marginTop: 16, width: '100%', height: 52, fontSize: 15,
                  background: '#16a34a', color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Ingresar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px 24px 24px', fontSize: 11, color: palette.subtext, letterSpacing: '0.04em' }}>
        ¿Olvidaste tu clave? Consultá en recepción.
      </div>
    </div>
  )
}
