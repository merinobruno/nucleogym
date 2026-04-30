# Gimnasio Núcleo — Contexto del Proyecto

## ¿Qué es esto?

Plataforma web para el **Gimnasio Núcleo** que reemplaza las hojas de papel con las rutinas de entrenamiento. Los socios acceden desde el celular sin instalar nada. Los entrenadores administran todo desde un panel web.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend + API routes | Next.js (App Router) |
| Base de datos + Auth + Storage | Supabase |
| Hosting + Deploy | Vercel |
| Control de versiones | GitHub |

---

## Esquema de base de datos

### Tabla: `ejercicios`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
nombre        text NOT NULL
descripcion   text
imagen_url    text
eliminado     boolean NOT NULL DEFAULT false
created_at    timestamptz DEFAULT now()
```

### Tabla: `socios`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
nombre        text NOT NULL
dni           text NOT NULL UNIQUE
clave         text NOT NULL
activo        boolean NOT NULL DEFAULT true
created_at    timestamptz DEFAULT now()
```

### Tabla: `rutina_ejercicios`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
socio_id        uuid NOT NULL REFERENCES socios(id) ON DELETE CASCADE
dia             integer NOT NULL  -- 1, 2, 3, 4, 5...
ejercicio_id    uuid REFERENCES ejercicios(id) ON DELETE SET NULL
series          integer
repeticiones    integer
nota            text
orden           integer NOT NULL DEFAULT 0
created_at      timestamptz DEFAULT now()
```

> **Nota importante:** cuando `ejercicio_id` es NULL y el campo `eliminado` del ejercicio referenciado es true, el frontend muestra ese ejercicio como **ELIMINADO** en la rutina. No se borran filas de `rutina_ejercicios` al eliminar un ejercicio.

---

## Roles y autenticación

- **Socios:** no tienen cuenta en Supabase Auth. Se autentican con DNI + clave (campo texto en la tabla `socios`). La sesión se maneja del lado del cliente con `localStorage` o cookies simples.
- **Entrenador:** una única cuenta en Supabase Auth (email + password). Se autentica con el sistema nativo de Supabase. Accede al panel de administración.

---

## Estructura del proyecto (Next.js App Router)

```
/app
  /page.tsx                  → Pantalla pública: buscador por DNI
  /rutina/[socioId]/page.tsx → Vista de rutina del socio (protegida por clave)
  /admin
    /login/page.tsx          → Login del entrenador
    /layout.tsx              → Layout protegido (verifica sesión Supabase)
    /page.tsx                → Redirect a /admin/socios
    /socios/page.tsx         → Lista de socios con filtros
    /socios/nuevo/page.tsx   → Alta de socio
    /socios/[id]/page.tsx    → Detalle y edición de socio + editor de rutina
    /ejercicios/page.tsx     → Biblioteca de ejercicios

/components
  /socio/
    BuscadorDNI.tsx
    ListaDias.tsx
    DetalleEjercicio.tsx
  /admin/
    TablasSocios.tsx
    FiltrosSocios.tsx
    EditorRutina.tsx
    TabDias.tsx
    FilaEjercicio.tsx
    FormularioSocio.tsx
    TablaEjercicios.tsx
    FormularioEjercicio.tsx

/lib
  supabase.ts               → Cliente de Supabase (browser)
  supabase-server.ts        → Cliente de Supabase (server)
  auth.ts                   → Helpers de autenticación
```

---

## Flujos principales

### Flujo del socio (público)
1. El socio entra a `/` e ingresa su DNI
2. Si el DNI existe y el socio está **activo**, se le pide la clave
3. Si la clave es correcta, se lo redirige a `/rutina/[socioId]`
4. Ve los días disponibles (Día 1, Día 2, etc.) como tabs o lista
5. Elige un día y ve la lista de ejercicios
6. Toca un ejercicio para ver nombre, series, repeticiones, nota del entrenador, descripción e imagen
7. Si un ejercicio fue eliminado de la biblioteca, aparece tachado y marcado como **ELIMINADO**

### Flujo del entrenador (privado)
1. El entrenador entra a `/admin/login` y se autentica con email + password (Supabase Auth)
2. Accede a `/admin/socios` — ve la tabla con filtros: todos / activos / inactivos
3. Puede crear un socio nuevo desde `/admin/socios/nuevo`
4. Desde la tabla, accede al perfil de un socio: `/admin/socios/[id]`
5. En el perfil puede editar datos, cambiar clave y editar la rutina
6. El editor de rutina tiene tabs por día. El botón **+** agrega un día nuevo. Cada día tiene su lista de ejercicios con campos de series, repeticiones y nota, más un buscador para agregar ejercicios de la biblioteca
7. **Todos los cambios en la rutina se guardan instantáneamente** (sin botón de guardar)
8. Desde `/admin/ejercicios` gestiona la biblioteca: crear, editar y eliminar ejercicios

---

## Comportamientos especiales

### Ejercicio eliminado
- Al eliminar un ejercicio de la biblioteca, se setea `eliminado = true` en la tabla `ejercicios`
- **No se tocan las filas de `rutina_ejercicios`** que lo referencian
- En la vista del socio y en el panel del entrenador, ese ejercicio se muestra como **ELIMINADO** (con estilo visual diferenciado: tachado, color rojo o gris)
- El socio debe acercarse al entrenador para actualizar su rutina

### Socio inactivo
- Un socio con `activo = false` no aparece en el buscador público
- El entrenador lo ve siempre en el panel con el filtro correspondiente
- El entrenador puede reactivarlo en cualquier momento

### Guardado automático de rutinas
- Cada acción en el editor de rutinas (agregar ejercicio, cambiar series, escribir una nota, eliminar un ejercicio) dispara un upsert/delete inmediato a Supabase
- No hay botón de "Guardar". El feedback puede ser un indicador visual sutil (ej: checkmark animado)

---

## Orden de desarrollo recomendado

1. **Setup inicial** — Next.js + Supabase + Vercel + GitHub conectados y desplegados
2. **Schema de base de datos** — crear las tablas en Supabase con el schema de arriba
3. **Login del entrenador** — `/admin/login` con Supabase Auth, layout protegido
4. **Biblioteca de ejercicios** — CRUD completo en `/admin/ejercicios`
5. **Gestión de socios** — alta, lista con filtros, edición de datos y clave
6. **Editor de rutinas** — lo más complejo, construirlo sobre lo anterior
7. **Vista pública del socio** — buscador por DNI, clave, días, detalle de ejercicio
8. **Comportamiento de ejercicio eliminado** — verificar que se muestra correctamente en ambas vistas
9. **Pulido visual y responsive** — optimizar para móvil, que es el dispositivo principal de los socios

---

## Consideraciones de UX

- La vista del socio debe estar **optimizada para móvil** — es el uso principal
- El panel del entrenador puede asumir escritorio, pero no romperse en móvil
- Los cambios en la rutina deben sentirse instantáneos — usar optimistic UI si es necesario
- El ejercicio ELIMINADO debe ser visualmente claro para el socio, sin ser alarmante

---

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
