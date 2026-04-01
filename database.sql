-- Crear la tabla pública de perfiles
create table public.perfiles (
  id uuid references auth.users on delete cascade not null primary key,
  nombre text,
  email text,
  rol text check (rol in ('ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO')) default 'EMPLEADO',
  activo boolean default true,
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.perfiles enable row level security;

-- Crear políticas de seguridad
-- Todos los usuarios autenticados pueden ver los perfiles (para popular selectores y tablas)
create policy "Los perfiles son visibles para usuarios autenticados" 
on perfiles for select using (auth.role() = 'authenticated');

-- Un usuario puede actualizar su propio nombre (pero no su rol, eso lo hace el admin)
create policy "Usuarios pueden editar su propio perfil" 
on perfiles for update using (auth.uid() = id);

-- NOTA: La lógica estricta de "solo Administrador puede asignar roles" u otras 
-- se puede hacer en el backend Next.js (Server Actions o API Routes) enviando
-- peticiones con el service_role key, o crear funciones Postgres más avanzadas.

-- Crear una función para insertar automáticamente un perfil cuando un usuario se registra
create or replace function public.manejador_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, email, nombre, rol, activo)
  values (
    new.id, 
    new.email, 
    -- Se asume que el nombre puede venir en el raw_user_meta_data si es un registro con campos extra
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    -- Si es el primer usuario en toda la bd, hacerlo Administrador
    case when not exists (select 1 from public.perfiles) then 'ADMINISTRADOR'
    else 'EMPLEADO' end,
    true
  );
  return new;
end;
$$;

-- Crear el trigger que llama a la función al insertar en auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.manejador_nuevo_usuario();
