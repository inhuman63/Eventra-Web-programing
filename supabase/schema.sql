-- Eventra demo schema for Supabase Postgres

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  date date not null,
  venue text not null,
  capacity int not null check (capacity > 0),
  price numeric(10,2) not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_code text not null unique default 'EVT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  attendance_status text not null default 'pending' check (attendance_status in ('pending', 'checked_in')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'present')),
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_upsert_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_admin_write" on public.events;
create policy "events_public_read" on public.events for select using (is_active = true);
create policy "events_admin_write" on public.events for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "registrations_user_read_own" on public.registrations;
drop policy if exists "registrations_user_insert_own" on public.registrations;
drop policy if exists "registrations_admin_manage" on public.registrations;
create policy "registrations_user_read_own" on public.registrations for select using (auth.uid() = user_id);
create policy "registrations_user_insert_own" on public.registrations for insert with check (auth.uid() = user_id);
create policy "registrations_admin_manage" on public.registrations for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "attendance_user_read_own" on public.attendance;
drop policy if exists "attendance_user_insert_own" on public.attendance;
drop policy if exists "attendance_admin_manage" on public.attendance;
create policy "attendance_user_read_own" on public.attendance for select using (auth.uid() = user_id);
create policy "attendance_user_insert_own" on public.attendance for insert with check (auth.uid() = user_id);
create policy "attendance_admin_manage" on public.attendance for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();
