-- Tabla: ejercicios
create table ejercicios (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  descripcion   text,
  imagen_url    text,
  eliminado     boolean not null default false,
  created_at    timestamptz default now()
);

-- Tabla: socios
create table socios (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  dni           text not null unique,
  clave         text not null,
  activo        boolean not null default true,
  created_at    timestamptz default now()
);

-- Tabla: rutina_ejercicios
create table rutina_ejercicios (
  id              uuid primary key default gen_random_uuid(),
  socio_id        uuid not null references socios(id) on delete cascade,
  dia             integer not null,
  ejercicio_id    uuid references ejercicios(id) on delete set null,
  series          integer,
  repeticiones    integer,
  nota            text,
  orden           integer not null default 0,
  created_at      timestamptz default now()
);

-- RLS: habilitado, pero todas las operaciones van por server con service_role
-- que bypasea RLS por defecto. Las políticas de abajo son por si se usa anon.
alter table ejercicios enable row level security;
alter table socios enable row level security;
alter table rutina_ejercicios enable row level security;

-- El entrenador (autenticado en Supabase Auth) tiene acceso total
create policy "entrenador full access ejercicios"
  on ejercicios for all
  to authenticated
  using (true)
  with check (true);

create policy "entrenador full access socios"
  on socios for all
  to authenticated
  using (true)
  with check (true);

create policy "entrenador full access rutina_ejercicios"
  on rutina_ejercicios for all
  to authenticated
  using (true)
  with check (true);

-- Lectura pública (anon) para el flujo del socio vía server components
create policy "anon read ejercicios"
  on ejercicios for select
  to anon
  using (true);

create policy "anon read socios"
  on socios for select
  to anon
  using (true);

create policy "anon read rutina_ejercicios"
  on rutina_ejercicios for select
  to anon
  using (true);
