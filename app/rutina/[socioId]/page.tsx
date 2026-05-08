'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useDarkMode } from '@/lib/useDarkMode'
import { getYouTubeEmbedUrl } from '@/lib/youtube'

type Ejercicio = {
  id: string
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  eliminado: boolean
}

type FilaRutina = {
  id: string
  ejercicio_id: string | null
  series: number | null
  repeticiones: number | null
  nota: string | null
  nota_socio: string | null
  orden: number
  ejercicio: Ejercicio | null
}

type Palette = {
  bg: string; surface: string; surfaceAlt: string
  border: string; borderSoft: string
  text: string; subtext: string; muted: string
  accent: string; accentSoft: string
  amberBg: string; amberText: string
  redBg: string; redText: string
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function ExitIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function DumbbellIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M6 9h12M6 15h12M3 7h3M18 7h3M3 17h3M18 17h3"/>
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function StatBox({ label, value, palette }: { label: string; value: number | null; palette: Palette }) {
  return (
    <div style={{ background: palette.surfaceAlt, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: palette.muted }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: palette.text, letterSpacing: '-0.01em', marginTop: 2, fontVariantNumeric: 'tabular-nums' as const }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

function ExerciseCard({ fila, idx, expanded, onToggle, palette, onSaveNota }: {
  fila: FilaRutina; idx: number; expanded: boolean; onToggle: () => void; palette: Palette
  onSaveNota: (nota: string) => Promise<void>
}) {
  const eliminado = fila.ejercicio?.eliminado ?? fila.ejercicio_id === null
  const nombre = fila.ejercicio?.nombre ?? 'Ejercicio eliminado'
  const [notaSocio, setNotaSocio] = useState(fila.nota_socio ?? '')
  const [saved, setSaved] = useState(false)

  async function handleSaveNota() {
    await onSaveNota(notaSocio)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color .15s',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          background: 'transparent', border: 'none',
          padding: '14px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', color: palette.text,
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: eliminado ? palette.redBg : palette.accentSoft,
          color: eliminado ? palette.redText : palette.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' as const,
        }}>
          {String(idx).padStart(2, '0')}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
            textDecoration: eliminado ? 'line-through' : 'none',
            color: eliminado ? palette.redText : palette.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {nombre}
          </div>
          <div style={{ fontSize: 12, color: palette.subtext, marginTop: 2 }}>
            {eliminado ? (
              <span style={{ color: palette.redText, fontWeight: 600 }}>Consultar al entrenador</span>
            ) : (
              <>
                <span style={{ fontWeight: 700, color: palette.text }}>{fila.series ?? '—'}</span>
                <span style={{ color: palette.muted }}> series · </span>
                <span style={{ fontWeight: 700, color: palette.text }}>{fila.repeticiones ?? '—'}</span>
                <span style={{ color: palette.muted }}> reps</span>
              </>
            )}
          </div>
        </div>

        <div style={{
          width: 28, height: 28, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: palette.muted,
          transition: 'transform .2s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <ChevronDownIcon />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!eliminado && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              <StatBox label="Series" value={fila.series} palette={palette} />
              <StatBox label="Repeticiones" value={fila.repeticiones} palette={palette} />
            </div>
          )}

          {fila.nota && (
            <div style={{
              background: palette.amberBg, borderRadius: 10, padding: '10px 12px',
              display: 'flex', gap: 10,
            }}>
              <div style={{ flexShrink: 0, marginTop: 1, color: palette.amberText }}>
                <NoteIcon />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: palette.amberText, marginBottom: 2 }}>
                  Nota del entrenador
                </div>
                <div style={{ fontSize: 13, color: palette.amberText, lineHeight: 1.45 }}>{fila.nota}</div>
              </div>
            </div>
          )}

          {fila.ejercicio?.imagen_url && !eliminado && (() => {
            const embedUrl = getYouTubeEmbedUrl(fila.ejercicio!.imagen_url!)
            if (!embedUrl) return null
            return (
              <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  title={fila.ejercicio!.nombre}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            )
          })()}

          {fila.ejercicio?.descripcion && !eliminado && (
            <div style={{ fontSize: 13, color: palette.subtext, lineHeight: 1.5 }}>
              {fila.ejercicio.descripcion}
            </div>
          )}

          {eliminado && (
            <div style={{
              background: palette.redBg, color: palette.redText,
              borderRadius: 10, padding: '10px 12px',
              fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}><AlertIcon /></div>
              <span>Este ejercicio fue removido por tu entrenador. Consultá antes de la próxima sesión.</span>
            </div>
          )}

          {/* Nota personal del socio */}
          <div style={{ borderTop: `1px solid ${palette.border}`, paddingTop: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: palette.muted, marginBottom: 6 }}>
              Tu nota personal
            </div>
            <textarea
              value={notaSocio}
              onChange={e => setNotaSocio(e.target.value)}
              onBlur={handleSaveNota}
              placeholder="Ej: 20kg mancuernas, agarre neutro..."
              rows={2}
              style={{
                width: '100%', padding: '8px 10px',
                background: palette.surfaceAlt,
                border: `1px solid ${palette.border}`,
                borderRadius: 8, resize: 'none',
                fontSize: 13, color: palette.text,
                outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box' as const,
              }}
            />
            <div style={{ fontSize: 11, color: saved ? palette.accent : 'transparent', marginTop: 4, transition: 'color .2s' }}>
              ✓ Guardado
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ palette }: { palette: Palette }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div>
        <div style={{
          width: 72, height: 72, borderRadius: 999,
          background: palette.accentSoft, color: palette.accent,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <DumbbellIcon />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em', color: palette.text }}>
          Tu rutina está en preparación
        </h2>
        <p style={{ fontSize: 14, color: palette.subtext, margin: 0, maxWidth: 280, lineHeight: 1.5 }}>
          Tu entrenador está armando tu plan personalizado. Apenas esté listo, lo vas a ver acá.
        </p>
      </div>
    </div>
  )
}

export default function RutinaPage() {
  const router = useRouter()
  const { socioId } = useParams<{ socioId: string }>()
  const { dark, toggle } = useDarkMode()
  const [nombre, setNombre] = useState('')
  const [dias, setDias] = useState<number[]>([])
  const [diaActivo, setDiaActivo] = useState<number>(1)
  const [filas, setFilas] = useState<Record<number, FilaRutina[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedId = localStorage.getItem('nucleogym_socio')
    if (storedId !== socioId) {
      router.replace('/')
      return
    }
    loadData()
  }, [socioId])

  useEffect(() => {
    function handlePop() { setExpanded(null) }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  function toggleExpand(id: string) {
    if (expanded === id) {
      if (window.history.state?.__nucleoExpanded) {
        window.history.back()
      } else {
        setExpanded(null)
      }
    } else {
      try { window.history.pushState({ __nucleoExpanded: id }, '') } catch {}
      setExpanded(id)
    }
  }

  async function loadData() {
    const supabase = createClient()
    const [{ data: socioData }, { data: rutinaData }] = await Promise.all([
      supabase.from('socios').select('nombre').eq('id', socioId).single(),
      supabase
        .from('rutina_ejercicios')
        .select('*, ejercicios(id, nombre, descripcion, imagen_url, eliminado)')
        // nota_socio is included in the wildcard *
        .eq('socio_id', socioId)
        .order('dia').order('orden'),
    ])

    if (socioData) setNombre(socioData.nombre)

    if (rutinaData) {
      const grouped: Record<number, FilaRutina[]> = {}
      const diasSet = new Set<number>()
      for (const row of rutinaData) {
        diasSet.add(row.dia)
        if (!grouped[row.dia]) grouped[row.dia] = []
        grouped[row.dia].push({
          id: row.id,
          ejercicio_id: row.ejercicio_id,
          series: row.series,
          repeticiones: row.repeticiones,
          nota: row.nota,
          nota_socio: row.nota_socio ?? null,
          orden: row.orden,
          ejercicio: row.ejercicios as Ejercicio | null,
        })
      }
      const sortedDias = Array.from(diasSet).sort((a, b) => a - b)
      setDias(sortedDias)
      if (sortedDias.length > 0) setDiaActivo(sortedDias[0])
      setFilas(grouped)
    }

    setLoading(false)
  }

  async function saveNotaSocio(filaId: string, nota: string) {
    const supabase = createClient()
    await supabase.from('rutina_ejercicios').update({ nota_socio: nota || null }).eq('id', filaId)
    setFilas(prev => {
      const next = { ...prev }
      for (const dia in next) {
        next[+dia] = next[+dia].map(f => f.id === filaId ? { ...f, nota_socio: nota || null } : f)
      }
      return next
    })
  }

  function handleLogout() {
    localStorage.removeItem('nucleogym_socio')
    router.push('/')
  }

  const palette: Palette = dark ? {
    bg: '#0a0a0a', surface: '#171717', surfaceAlt: '#0f0f0f',
    border: '#262626', borderSoft: '#1f1f1f',
    text: '#fafafa', subtext: '#a3a3a3', muted: '#525252',
    accent: '#22c55e', accentSoft: 'rgba(34,197,94,0.15)',
    amberBg: 'rgba(251,191,36,0.08)', amberText: '#fbbf24',
    redBg: 'rgba(239,68,68,0.10)', redText: '#f87171',
  } : {
    bg: '#fafafa', surface: '#ffffff', surfaceAlt: '#f5f5f5',
    border: '#e5e5e5', borderSoft: '#efefef',
    text: '#0a0a0a', subtext: '#525252', muted: '#a3a3a3',
    accent: '#16a34a', accentSoft: '#dcfce7',
    amberBg: '#fef3c7', amberText: '#92400e',
    redBg: '#fef2f2', redText: '#b91c1c',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: palette.muted }}>Cargando tu rutina...</p>
      </div>
    )
  }

  const empty = dias.length === 0

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, color: palette.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: palette.bg,
        borderBottom: `1px solid ${palette.border}`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Núcleo" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: palette.muted }}>Socio</div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
        </div>
        <button
          onClick={toggle}
          aria-label="Cambiar tema"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'transparent', border: `1px solid ${palette.border}`,
            color: palette.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          onClick={handleLogout}
          style={{
            height: 36, padding: '0 12px', borderRadius: 999,
            background: 'transparent', border: `1px solid ${palette.border}`,
            color: palette.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600,
          }}
        >
          <ExitIcon />
          Salir
        </button>
      </header>

      {empty ? (
        <EmptyState palette={palette} />
      ) : (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Routine title */}
          <div style={{ padding: '20px 16px 8px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: palette.muted, marginBottom: 4 }}>
              Tu rutina
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: palette.text }}>
              {nombre}
            </h1>
          </div>

          {/* Day tabs — sticky below header */}
          <div style={{
            position: 'sticky', top: 65, zIndex: 5,
            background: palette.bg,
            borderBottom: `1px solid ${palette.borderSoft}`,
            padding: '12px 0 0',
          }}>
            <div style={{
              display: 'flex', gap: 4, overflowX: 'auto',
              padding: '0 16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {dias.map(dia => {
                const active = dia === diaActivo
                return (
                  <button
                    key={dia}
                    onClick={() => { setDiaActivo(dia); setExpanded(null) }}
                    style={{
                      flexShrink: 0,
                      padding: '10px 16px 12px',
                      background: 'transparent', border: 'none',
                      borderBottom: `2px solid ${active ? palette.accent : 'transparent'}`,
                      color: active ? palette.text : palette.subtext,
                      fontSize: 14, fontWeight: active ? 700 : 500,
                      cursor: 'pointer', letterSpacing: '-0.005em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Día {dia}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Exercise list */}
          <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(filas[diaActivo] ?? []).map((fila, idx) => (
              <ExerciseCard
                key={fila.id}
                fila={fila}
                idx={idx + 1}
                expanded={expanded === fila.id}
                onToggle={() => toggleExpand(fila.id)}
                palette={palette}
                onSaveNota={(nota) => saveNotaSocio(fila.id, nota)}
              />
            ))}
            {(filas[diaActivo] ?? []).length > 0 && (
              <div style={{ fontSize: 11, color: palette.muted, textAlign: 'center', marginTop: 8, letterSpacing: '0.04em' }}>
                {(filas[diaActivo] ?? []).length} ejercicios · tocá para ver detalles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
