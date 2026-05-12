# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Plataforma web para el **Gimnasio Núcleo** que reemplaza las hojas de papel con rutinas de entrenamiento. Los socios acceden desde el celular sin instalar nada. Los entrenadores administran todo desde un panel web.

Stack: Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + TypeScript. Deploy en Vercel.

---

## Comandos

```bash
npm run dev      # servidor de desarrollo (localhost:3000)
npm run build    # build de producción (también valida tipos)
npm run lint     # ESLint
```

No hay tests automatizados. Verificar manualmente abriendo el navegador.

---

## Arquitectura de autenticación (dos sistemas separados)

Este es el aspecto más importante a entender antes de tocar cualquier página.

**Socios (no usan Supabase Auth):**
- Se autentican con DNI + clave (campo texto plano en la tabla `socios`)
- Tras autenticarse, se guarda `socioId` en `localStorage` con key `nucleogym_socio`
- Las páginas del socio verifican ese valor con `localStorage.getItem('nucleogym_socio')`
- El cliente Supabase en páginas de socios usa la anon key. Si hay RLS que bloquea operaciones, usar la API route `/api/nota` como patrón (usa `SUPABASE_SERVICE_ROLE_KEY` + valida que el row pertenece al socioId)

**Entrenador (usa Supabase Auth):**
- `app/admin/layout.tsx` verifica la sesión con `supabase.auth.getUser()` en cada render
- `lib/auth.ts` exporta `requireAuth()` para uso en Server Components
- `lib/supabase.ts` → cliente browser; `lib/supabase-server.ts` → cliente server (con cookies)

---

## Estructura real de archivos

La mayor parte de la UI está **inline en las páginas**, no en components:

```
app/
  page.tsx                        → Login socio (2 pasos: DNI → clave)
  rutina/[socioId]/page.tsx       → Vista de rutina del socio (mobile-first)
  admin/
    layout.tsx                    → Nav + protección de sesión
    page.tsx                      → Redirect a /admin/socios
    login/page.tsx
    socios/page.tsx               → Lista con filtros activos/inactivos/todos
    socios/nuevo/page.tsx
    socios/[id]/page.tsx          → Perfil + EditorRutina
    ejercicios/page.tsx           → Biblioteca con papelera (soft delete)
    ejercicios/nuevo/page.tsx
    ejercicios/[id]/page.tsx
    guia/page.tsx                 → Documentación estática para el entrenador
  api/
    nota/route.ts                 → POST: guarda nota_socio con service role key

components/
  admin/
    EditorRutina.tsx              → Único componente separado; maneja días y ejercicios de rutina

lib/
  supabase.ts                     → createClient() browser
  supabase-server.ts              → createClient() server (SSR con cookies)
  auth.ts                         → requireAuth() para Server Components
  capFirst.ts                     → capFirst(str), normalize(str) para búsqueda sin acentos
  youtube.ts                      → getYouTubeEmbedUrl(), getYouTubeThumbnail()
  useDarkMode.ts                  → hook, persiste en localStorage key "nucleogym_dark"
```

---

## Patrones de estilo

**Páginas de admin** (`/admin/*`): Tailwind CSS con clases utilitarias.

**Páginas del socio** (`/` y `/rutina/*`): inline styles con un objeto `Palette` que cambia entre modo claro y oscuro. No usar Tailwind en estas páginas — el dark mode se controla vía el hook `useDarkMode` y los estilos se pasan como prop a los componentes hijos.

```tsx
// Patrón en páginas de socio
const palette: Palette = dark ? { bg: '#0a0a0a', ... } : { bg: '#fafafa', ... }
// Se pasa como prop a todos los componentes de la página
```

---

## Esquema de base de datos

### `ejercicios`
```sql
id uuid PK, nombre text, descripcion text, imagen_url text,
tags text[] DEFAULT '{}',   -- grupos musculares, ej: ['Pecho', 'Tríceps']
eliminado boolean DEFAULT false, created_at timestamptz
```

### `socios`
```sql
id uuid PK, nombre text, dni text UNIQUE, clave text,
activo boolean DEFAULT true, created_at timestamptz
```

### `rutina_ejercicios`
```sql
id uuid PK, socio_id uuid → socios, dia integer,
ejercicio_id uuid → ejercicios ON DELETE SET NULL,
series integer, repeticiones integer,
nota text,           -- nota del entrenador, visible al socio
nota_socio text,     -- nota personal del socio (ej: "20kg mancuernas")
orden integer DEFAULT 0, created_at timestamptz
```

**Soft delete en ejercicios:** al eliminar, se setea `eliminado = true`. Las filas de `rutina_ejercicios` se mantienen. El frontend muestra el ejercicio tachado/rojo cuando `ejercicio.eliminado = true` o cuando `ejercicio_id = null`.

---

## Comportamientos clave

### Guardado automático (EditorRutina)
`components/admin/EditorRutina.tsx` usa inputs controlados (`value` + `onChange`) con debounce de 600ms hacia Supabase + flush inmediato en `onBlur`. No hay botón de guardar.

### Nota personal del socio
`app/rutina/[socioId]/page.tsx` guarda `nota_socio` via `POST /api/nota` (no directo a Supabase) para evitar problemas de RLS. El patrón: `onChange` debounce 600ms + `onBlur` flush inmediato + indicador visual "✓ Guardado".

### Búsqueda sin acentos
Usar siempre `normalize()` de `lib/capFirst.ts` para comparar strings. Ejemplo: `normalize('Tríceps').includes(normalize(query))`.

### Auto-capitalización
Aplicar `capFirst()` de `lib/capFirst.ts` en el `onChange` de inputs de texto para entrenadores. Agregar `autoCapitalize="sentences"` en el HTML para teclados móviles.

### Tags de ejercicios
`MUSCLE_TAGS` (lista fija de grupos musculares) está definida tanto en `EditorRutina.tsx` como en los forms de ejercicios. Los tags se almacenan como `text[]` en Postgres. El buscador del editor filtra por tag (OR entre tags seleccionados).

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # solo server-side, nunca exponer al cliente
```
