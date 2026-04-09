-- 1. Limpieza de tablas antiguas
drop table if exists public.perfiles cascade;
drop table if exists public.profiles cascade;

-- 2. Crear la tabla pública de 'profiles' con todos los campos solicitados
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  role text check (role in ('ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO')) default 'EMPLEADO',
  is_active boolean default true,
  phone text,
  avatar_url text,
  address text,
  last_login_at timestamp with time zone,
  login_count integer default 0,
  failed_attempts integer default 0,
  locked_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  create_by uuid -- id del usuario que creó este registro (si aplica)
);

-- 3. Habilitar Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 4. Políticas de seguridad
create policy "Los perfiles son visibles para usuarios autenticados" 
on public.profiles for select using (auth.role() = 'authenticated');

create policy "Usuarios pueden editar su propio perfil limitado" 
on public.profiles for update using (auth.uid() = id);

-- 5. Función para sincronización automática desde auth.users
create or replace function public.manejador_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
  )
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    -- Si es el primer usuario en la BD, hacerlo ADMINISTRADOR
    case when not exists (select 1 from public.profiles) then 'ADMINISTRADOR'
    else 'EMPLEADO' end,
    true,
    now(),
    now()
  );
  return new;
end;
$$;

-- 6. Crear el trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.manejador_nuevo_usuario();

-- 7. Función para actualizar el timestamp de updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
