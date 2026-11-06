-- ParFivra: jalankan seluruh script ini sekali di Supabase SQL Editor.
-- Script ini mengaktifkan CRUD produk admin dan upload gambar produk.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Hak akses produk: publik dapat melihat, hanya admin dapat mengubah.
alter table public.products enable row level security;

drop policy if exists "Products readable by all" on public.products;
drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Admins insert products" on public.products;
drop policy if exists "Admins update products" on public.products;
drop policy if exists "Admins delete products" on public.products;

create policy "Products readable by all"
  on public.products for select
  using (true);

create policy "Admins insert products"
  on public.products for insert to authenticated
  with check (public.is_admin());

create policy "Admins update products"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete products"
  on public.products for delete to authenticated
  using (public.is_admin());

-- Bucket gambar produk dan konten situs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read site assets" on storage.objects;
drop policy if exists "Admins upload site assets" on storage.objects;
drop policy if exists "Admins update site assets" on storage.objects;
drop policy if exists "Admins delete site assets" on storage.objects;

create policy "Public read site assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Admins upload site assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-assets' and public.is_admin());

create policy "Admins update site assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

create policy "Admins delete site assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-assets' and public.is_admin());
