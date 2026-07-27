-- ============================================================
-- ParFivra Parfum - Supabase Schema
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- PROFILES (extend auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper for RLS policies
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

-- PRODUCTS
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price integer not null,
  image_url text,
  category text default 'Floral',
  accord text,
  size_ml integer default 50,
  stock integer default 0,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- ORDERS
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  user_email text,
  items jsonb not null,
  total integer not null,
  status text default 'pending'
    check (status in ('pending','processing','shipped','delivered','cancelled')),
  shipping_name text not null,
  shipping_phone text,
  shipping_address text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Profiles
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins read profiles"
  on public.profiles for select using (public.is_admin());

-- Products
create policy "Products readable by all"
  on public.products for select using (true);

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- Orders
create policy "Users read own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users and guests create orders"
  on public.orders for insert with check (user_id is null or auth.uid() = user_id);

create policy "Admins manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- SAMPLE DATA (opsional - hapus jika tidak perlu)
-- ============================================================

insert into public.products (name, description, price, category, accord, size_ml, stock, is_featured) values
  ('Nuit de Bois', 'Oud gelap berpadu kayu cendana dan amber hangat. Tahan lama sepanjang malam.', 1850000, 'Woody', 'Oud - Sandalwood - Amber', 50, 15, true),
  ('Rose Eternelle', 'Rosa Bulgaria yang mewah dengan sentuhan melati dan musk putih bersih.', 2200000, 'Floral', 'Rose - Jasmine - Musk Blanc', 50, 8, true),
  ('Ocean Bleu', 'Segar seperti angin laut pagi hari dengan bergamot dan cedar.', 1650000, 'Fresh', 'Sea Salt - Bergamot - Cedar', 50, 20, true);

-- ============================================================
-- UNTUK MEMBUAT AKUN ADMIN:
-- 1. Daftar akun biasa lewat website
-- 2. Lalu jalankan query ini (ganti email@anda.com):
-- ============================================================

-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id from auth.users where email = 'email@anda.com'
-- );
