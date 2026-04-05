-- VenShares MVP schema + RLS (Supabase Auth, projects, files, storage)
-- Run in Supabase SQL Editor or via CLI: supabase db push

-- Profiles (minimal PII; extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  username text,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Projects (owner = user_id; matches legacy venshares-vite)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Files metadata (storage path under bucket project-files)
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists files_project_id_idx on public.files (project_id);

alter table public.files enable row level security;

create policy "files_select_project_owner"
  on public.files for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = files.project_id and p.user_id = auth.uid()
    )
  );

create policy "files_insert_project_owner"
  on public.files for insert
  with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.projects p
      where p.id = files.project_id and p.user_id = auth.uid()
    )
  );

create policy "files_delete_project_owner"
  on public.files for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = files.project_id and p.user_id = auth.uid()
    )
  );

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

-- Storage RLS: path format "{project_id}/..."
create policy "storage_select_own_project"
  on storage.objects for select
  using (
    bucket_id = 'project-files'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.projects p
      where p.id::text = split_part(storage.objects.name, '/', 1)
        and p.user_id = auth.uid()
    )
  );

create policy "storage_insert_own_project"
  on storage.objects for insert
  with check (
    bucket_id = 'project-files'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.projects p
      where p.id::text = split_part(storage.objects.name, '/', 1)
        and p.user_id = auth.uid()
    )
  );

create policy "storage_update_own_project"
  on storage.objects for update
  using (
    bucket_id = 'project-files'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.projects p
      where p.id::text = split_part(storage.objects.name, '/', 1)
        and p.user_id = auth.uid()
    )
  );

create policy "storage_delete_own_project"
  on storage.objects for delete
  using (
    bucket_id = 'project-files'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.projects p
      where p.id::text = split_part(storage.objects.name, '/', 1)
        and p.user_id = auth.uid()
    )
  );

-- Auto-create profile on signup (optional; app also upserts on login)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', ''),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
