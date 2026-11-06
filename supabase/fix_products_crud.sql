-- Jalankan sekali di Supabase SQL Editor setelah perubahan schema/policy.
-- Script ini menjaga akses baca produk untuk publik dan akses CRUD hanya untuk admin.

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
