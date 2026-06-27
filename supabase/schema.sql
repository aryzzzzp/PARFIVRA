-- ============================================================
-- ParFivra Parfum — Supabase Schema
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
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
  items jsonb not null,
  total integer not null,
  status text default 'pending'
    check (status in ('pending','processing','shipped','delivered','cancelled')),
  customer_name text not null,
  customer_phone text,
  customer_address text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Profiles: user can read own
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Products: anyone can read
create policy "Products readable by all"
  on public.products for select using (true);

-- Products: only admin can mutate
create policy "Admins manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Orders: user sees own orders
create policy "Users read own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users create own orders"
  on public.orders for insert with check (auth.uid() = user_id);

-- Admin sees all orders
create policy "Admins manage orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- SAMPLE DATA (opsional — hapus jika tidak perlu)
-- ============================================================

insert into public.products (name, description, price, category, accord, size_ml, stock, is_featured) values
  ('Nuit de Bois', 'Oud gelap berpadu kayu cendana dan amber hangat. Tahan lama sepanjang malam.', 1850000, 'Woody', 'Oud · Sandalwood · Amber', 50, 15, true),
  ('Rose Éternelle', 'Rosa Bulgaria yang mewah dengan sentuhan melati dan musk putih bersih.', 2200000, 'Floral', 'Rose · Jasmine · Musk Blanc', 50, 8, true),
  ('Océan Bleu', 'Segar seperti angin laut pagi hari dengan bergamot dan cedar.', 1650000, 'Fresh', 'Sea Salt · Bergamot · Cedar', 50, 20, true);

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
