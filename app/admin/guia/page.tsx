'use client'

import { useState } from 'react'

type Section = {
  id: string
  label: string
  subsections?: { id: string; label: string }[]
}

const SECTIONS: Section[] = [
  { id: 'inicio', label: 'Inicio rápido' },
  {
    id: 'socios', label: 'Socios',
    subsections: [
      { id: 'socios-lista', label: 'Ver y filtrar' },
      { id: 'socios-nuevo', label: 'Dar de alta' },
      { id: 'socios-editar', label: 'Editar datos' },
      { id: 'socios-estado', label: 'Activar / desactivar' },
    ],
  },
  {
    id: 'rutinas', label: 'Rutinas',
    subsections: [
      { id: 'rutinas-estructura', label: 'Estructura' },
      { id: 'rutinas-dias', label: 'Agregar días' },
      { id: 'rutinas-ejercicios', label: 'Agregar ejercicios' },
      { id: 'rutinas-campos', label: 'Series, reps y nota' },
      { id: 'rutinas-guardado', label: 'Guardado automático' },
    ],
  },
  {
    id: 'biblioteca', label: 'Biblioteca de ejercicios',
    subsections: [
      { id: 'biblioteca-crear', label: 'Crear ejercicio' },
      { id: 'biblioteca-tags', label: 'Grupos musculares' },
      { id: 'biblioteca-video', label: 'Video de YouTube' },
      { id: 'biblioteca-eliminar', label: 'Eliminar y restaurar' },
    ],
  },
  {
    id: 'socio-vista', label: 'Vista del socio',
    subsections: [
      { id: 'socio-acceso', label: 'Cómo accede' },
      { id: 'socio-rutina', label: 'Su rutina' },
      { id: 'socio-notas', label: 'Sus notas personales' },
      { id: 'socio-eliminado', label: 'Ejercicio eliminado' },
    ],
  },
]

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-900 text-white mx-0.5">
      {children}
    </span>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl p-4 my-4">
      <span className="text-green-600 text-lg leading-snug">💡</span>
      <p className="text-sm text-green-800 leading-relaxed">{children}</p>
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 my-4">
      <span className="text-amber-600 text-lg leading-snug">⚠️</span>
      <p className="text-sm text-amber-800 leading-relaxed">{children}</p>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-3">
      <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </span>
      <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
    </div>
  )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-extrabold text-gray-900 tracking-tight mt-12 mb-4 scroll-mt-24 border-b border-gray-100 pb-2">
      {children}
    </h2>
  )
}

function SubTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-base font-bold text-gray-800 mt-8 mb-3 scroll-mt-24">
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 leading-relaxed mb-3">{children}</p>
}

export default function GuiaPage() {
  const [activeSection, setActiveSection] = useState('inicio')

  function scrollTo(id: string) {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex gap-10 items-start">
      {/* Sidebar */}
      <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-24 self-start">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contenido</p>
        <nav className="space-y-0.5">
          {SECTIONS.map(s => (
            <div key={s.id}>
              <button
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection === s.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
              {s.subsections?.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => scrollTo(sub.id)}
                  className={`w-full text-left pl-6 pr-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeSection === sub.id ? 'text-green-700' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-24">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Panel del entrenador</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Guía de uso</h1>
          <p className="text-gray-500 text-sm mt-2">Todo lo que necesitás saber para gestionar el gimnasio desde el panel.</p>
        </div>

        {/* ── INICIO ─────────────────────────────────────── */}
        <SectionTitle id="inicio">Inicio rápido</SectionTitle>
        <P>
          El panel está dividido en tres secciones principales: <strong>Socios</strong>, <strong>Ejercicios</strong> y esta <strong>Guía</strong>.
          Desde acá podés gestionar todo sin tocar código ni hojas de cálculo.
        </P>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {[
            { icon: '👤', title: 'Socios', desc: 'Creá y administrá los socios, sus datos y su estado.' },
            { icon: '🏋️', title: 'Rutinas', desc: 'Armá y editá la rutina personalizada de cada socio.' },
            { icon: '📚', title: 'Ejercicios', desc: 'Gestioná la biblioteca de ejercicios disponibles.' },
          ].map(c => (
            <div key={c.title} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-2">{c.icon}</div>
              <p className="font-semibold text-gray-900 text-sm mb-1">{c.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <Tip>
          Todos los cambios en las rutinas se guardan automáticamente. No hay botón "Guardar" — cada vez que modificás algo, se actualiza al instante.
        </Tip>

        {/* ── SOCIOS ─────────────────────────────────────── */}
        <SectionTitle id="socios">Socios</SectionTitle>

        <SubTitle id="socios-lista">Ver y filtrar la lista</SubTitle>
        <P>
          Entrando a <Tag>Socios</Tag> en la barra superior vas a ver la tabla con todos los socios.
          Por defecto muestra solo los <strong>activos</strong>.
        </P>
        <P>
          Usá los botones <Tag>Activos</Tag> <Tag>Inactivos</Tag> <Tag>Todos</Tag> para cambiar el filtro,
          y el campo de búsqueda para encontrar un socio por nombre o DNI (sin importar si usás acentos o no).
        </P>

        <SubTitle id="socios-nuevo">Dar de alta un socio nuevo</SubTitle>
        <Step n={1}>Hacé click en <Tag>+ Nuevo socio</Tag> arriba a la derecha.</Step>
        <Step n={2}>Completá el <strong>nombre completo</strong> del socio.</Step>
        <Step n={3}>Ingresá el <strong>DNI</strong> sin puntos ni espacios (ej: 43488265).</Step>
        <Step n={4}>
          Elegí una <strong>clave</strong> que el socio va a usar para ver su rutina desde el celular.
          Puede ser algo simple que el socio ya conozca o vos le digas en recepción.
        </Step>
        <Step n={5}>Hacé click en <Tag>Guardar</Tag>.</Step>
        <Tip>La clave la podés cambiar en cualquier momento desde el perfil del socio.</Tip>

        <SubTitle id="socios-editar">Editar datos de un socio</SubTitle>
        <P>
          Desde la lista hacé click en <Tag>Ver perfil →</Tag> en la fila del socio.
          En la página que se abre, el panel de la izquierda muestra los datos: nombre, DNI y clave.
          Modificá lo que necesitás y hacé click en <Tag>Guardar</Tag>.
        </P>

        <SubTitle id="socios-estado">Activar / desactivar un socio</SubTitle>
        <P>
          En el perfil del socio hay un toggle (interruptor) que dice <strong>Activo</strong> o <strong>Inactivo</strong>.
          Al desactivarlo, el socio deja de aparecer en el buscador público y no puede ver su rutina
          hasta que lo volvás a activar. <strong>La rutina no se borra</strong> — queda guardada.
        </P>
        <Warning>
          Un socio inactivo no puede acceder al sistema desde su celular. Si alguien no puede entrar,
          verificá primero que esté activo.
        </Warning>

        {/* ── RUTINAS ────────────────────────────────────── */}
        <SectionTitle id="rutinas">Rutinas</SectionTitle>

        <SubTitle id="rutinas-estructura">Estructura de una rutina</SubTitle>
        <P>
          Cada socio tiene una rutina dividida en <strong>días</strong> (Día 1, Día 2, etc.).
          Cada día tiene su propia lista de ejercicios con series, repeticiones y una nota opcional.
        </P>
        <P>
          No hay un límite de días ni de ejercicios por día. Podés armar desde una rutina de 3 días
          hasta una de 6 días o más.
        </P>

        <SubTitle id="rutinas-dias">Agregar y eliminar días</SubTitle>
        <P>
          En el editor de rutina (panel derecho dentro del perfil del socio) vas a ver los días como solapas.
        </P>
        <Step n={1}>Para agregar un día, hacé click en <Tag>+ Día</Tag> al final de las solapas.</Step>
        <Step n={2}>El nuevo día se crea vacío y queda seleccionado automáticamente.</Step>
        <P>
          Para eliminar un día, hacé click en la <strong>×</strong> que aparece al lado del nombre del día en su solapa.
          Esto borra el día y todos sus ejercicios de forma permanente.
        </P>
        <Warning>Eliminar un día no se puede deshacer. Todos los ejercicios de ese día se pierden.</Warning>

        <SubTitle id="rutinas-ejercicios">Agregar ejercicios a un día</SubTitle>
        <Step n={1}>Seleccioná el día donde querés agregar el ejercicio.</Step>
        <Step n={2}>Hacé click en <Tag>+ Agregar ejercicio</Tag> al pie de la tabla.</Step>
        <Step n={3}>
          Aparecen los chips de <strong>grupos musculares</strong>. Hacé click en uno o varios para filtrar
          la búsqueda por categoría.
        </Step>
        <Step n={4}>
          Escribí el nombre del ejercicio en el campo de texto. La búsqueda no distingue acentos
          (podés escribir "Triceps" y va a encontrar "Tríceps").
        </Step>
        <Step n={5}>Hacé click en el ejercicio que querés agregar de la lista de resultados.</Step>
        <Tip>
          Podés combinar filtro por tag y búsqueda por nombre al mismo tiempo.
          Por ejemplo: filtrar por "Bíceps" y escribir "curl" para ver solo los curl de bíceps.
        </Tip>

        <SubTitle id="rutinas-campos">Series, repeticiones y nota del entrenador</SubTitle>
        <P>
          Una vez agregado el ejercicio, aparece en la tabla del día con tres campos editables:
        </P>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden my-4">
          {[
            { campo: 'Series', desc: 'Cantidad de series. Ej: 4' },
            { campo: 'Reps', desc: 'Repeticiones por serie. Ej: 12' },
            { campo: 'Nota del entrenador', desc: 'Instrucción visible para el socio al expandir el ejercicio. Ej: "Empezá con el 70% de tu máximo."' },
          ].map((r, i) => (
            <div key={r.campo} className={`flex gap-4 px-4 py-3 text-sm ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <span className="font-semibold text-gray-900 w-40 flex-shrink-0">{r.campo}</span>
              <span className="text-gray-500">{r.desc}</span>
            </div>
          ))}
        </div>
        <P>
          Para editar cualquier campo, hacé click adentro, cambiá el valor y hacé click afuera (o presioná Tab).
          El cambio se guarda solo.
        </P>
        <P>
          Para eliminar un ejercicio del día, hacé click en la <strong>×</strong> al final de su fila.
        </P>

        <SubTitle id="rutinas-guardado">Guardado automático</SubTitle>
        <P>
          No hay botón de guardar en el editor de rutinas. Cada acción se guarda instantáneamente:
          agregar o eliminar un ejercicio, cambiar series, repeticiones o notas.
        </P>
        <P>
          Si el socio está mirando su rutina en ese momento, va a ver los cambios la próxima vez que abra un ejercicio.
        </P>

        {/* ── BIBLIOTECA ─────────────────────────────────── */}
        <SectionTitle id="biblioteca">Biblioteca de ejercicios</SectionTitle>
        <P>
          La biblioteca es el catálogo global de ejercicios disponibles para armar rutinas.
          Desde acá podés crear, editar y eliminar ejercicios.
        </P>

        <SubTitle id="biblioteca-crear">Crear un ejercicio</SubTitle>
        <Step n={1}>Entrá a <Tag>Ejercicios</Tag> en la barra superior.</Step>
        <Step n={2}>Hacé click en <Tag>+ Nuevo ejercicio</Tag>.</Step>
        <Step n={3}>Escribí el nombre del ejercicio.</Step>
        <Step n={4}>Opcionalmente agregá una descripción con la técnica o instrucciones.</Step>
        <Step n={5}>Seleccioná los grupos musculares que trabaja (ver sección siguiente).</Step>
        <Step n={6}>Opcionalmente pegá un link de YouTube con la demostración.</Step>
        <Step n={7}>Hacé click en <Tag>Guardar</Tag>.</Step>

        <SubTitle id="biblioteca-tags">Grupos musculares (tags)</SubTitle>
        <P>
          Al crear o editar un ejercicio, podés marcar los grupos musculares que trabaja
          haciendo click en los chips de colores.
        </P>
        <P>
          Si ninguno de los predefinidos describe bien el ejercicio, escribí el nombre en el
          <strong> chip de entrada</strong> que aparece al final de la fila (el que tiene borde punteado)
          y presioná <Tag>Enter</Tag>. Se agrega como tag personalizado.
        </P>
        <P>
          Estos tags le sirven al socio para saber qué está entrenando con cada ejercicio,
          y al entrenador para filtrar ejercicios rápidamente al armar rutinas.
        </P>

        <SubTitle id="biblioteca-video">Video de YouTube</SubTitle>
        <P>
          En el campo <strong>Video de YouTube</strong>, pegá la URL de cualquier formato:
        </P>
        <div className="bg-gray-50 rounded-xl p-4 my-4 space-y-1 font-mono text-xs text-gray-600">
          <p>https://youtube.com/watch?v=XXXX</p>
          <p>https://youtu.be/XXXX</p>
          <p>https://youtube.com/shorts/XXXX</p>
        </div>
        <P>
          Al pegar la URL correcta, aparece una vista previa del thumbnail.
          El socio ve el video embebido directamente dentro de su rutina al expandir el ejercicio.
        </P>

        <SubTitle id="biblioteca-eliminar">Eliminar y restaurar ejercicios</SubTitle>
        <P>
          Al eliminar un ejercicio desde la biblioteca, <strong>no se borra de las rutinas existentes</strong>.
          En cambio, queda marcado como <strong>ELIMINADO</strong> y el socio ve una advertencia en su lugar.
        </P>
        <Warning>
          Si eliminás un ejercicio que está en la rutina de varios socios, todos van a ver ese ejercicio
          tachado con el mensaje "Consultá al entrenador". Reemplazalo en cada rutina afectada.
        </Warning>
        <P>
          Los ejercicios eliminados van a la pestaña <Tag>Papelera</Tag> dentro de Ejercicios.
          Desde ahí podés restaurarlos con el botón <Tag>Restaurar</Tag> y vuelven a aparecer normalmente.
        </P>

        {/* ── VISTA DEL SOCIO ────────────────────────────── */}
        <SectionTitle id="socio-vista">Vista del socio</SectionTitle>

        <SubTitle id="socio-acceso">Cómo accede el socio</SubTitle>
        <P>
          El socio entra desde cualquier celular a la página principal del gimnasio.
          No necesita instalar ninguna aplicación.
        </P>
        <Step n={1}>Ingresa su <strong>DNI</strong> en el campo principal.</Step>
        <Step n={2}>Si el DNI existe y el socio está activo, ingresa su <strong>clave</strong>.</Step>
        <Step n={3}>Ve su rutina directamente.</Step>
        <Tip>
          Si un socio no puede entrar, verificá: que el DNI esté exactamente como lo cargaste
          (sin puntos ni espacios), que la clave sea correcta y que el socio esté activo.
        </Tip>

        <SubTitle id="socio-rutina">Su rutina</SubTitle>
        <P>
          El socio ve los días de su rutina como solapas horizontales desplazables.
          Al tocar una solapa, aparece la lista de ejercicios de ese día.
        </P>
        <P>
          Cada ejercicio muestra el nombre y el resumen (series × reps). Al tocarlo, se expande
          y muestra:
        </P>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden my-4">
          {[
            'Cajas con series y repeticiones',
            'Chips de grupos musculares (tags)',
            'Nota del entrenador (si cargaste una)',
            'Video de YouTube embebido (si cargaste uno)',
            'Descripción del ejercicio',
            'Campo de nota personal del socio',
          ].map((item, i) => (
            <div key={item} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        <SubTitle id="socio-notas">Notas personales del socio</SubTitle>
        <P>
          Dentro de cada ejercicio expandido, el socio tiene un campo de texto propio llamado
          <strong> Tu nota personal</strong>. Puede escribir cosas como el peso que usó, el agarre
          que le funciona mejor, o cualquier observación.
        </P>
        <P>
          La nota se guarda automáticamente al tocar fuera del campo. Aparece un
          <strong> ✓ Guardado</strong> en verde como confirmación. Estas notas son <strong>solo del socio</strong> —
          vos no las ves desde el panel.
        </P>

        <SubTitle id="socio-eliminado">Ejercicio eliminado</SubTitle>
        <P>
          Si eliminás un ejercicio de la biblioteca y ese ejercicio está en la rutina de un socio,
          el socio lo ve tachado con el nombre en rojo y el texto:
        </P>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 my-4 text-sm text-red-800">
          "Este ejercicio fue removido por tu entrenador. Consultá antes de la próxima sesión."
        </div>
        <P>
          La solución es ir a la rutina del socio y reemplazar ese ejercicio por otro, o restaurar
          el ejercicio eliminado desde la Papelera.
        </P>
      </div>
    </div>
  )
}
