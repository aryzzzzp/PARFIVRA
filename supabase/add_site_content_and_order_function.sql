-- Jalankan sekali pada proyek Supabase yang sudah ada.
-- Konten situs
create table if not exists public.site_pages (
  slug text primary key check (slug in ('home', 'about')),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.site_pages enable row level security;

drop policy if exists "Site pages readable by all" on public.site_pages;
create policy "Site pages readable by all"
  on public.site_pages for select using (true);

drop policy if exists "Admins manage site pages" on public.site_pages;
create policy "Admins manage site pages"
  on public.site_pages for all
  using (public.is_admin())
  with check (public.is_admin());
-- Buat pesanan dan kurangi stok dalam satu transaksi yang aman
create or replace function public.place_order(
  p_items jsonb,
  p_user_email text,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_address text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_total integer := 0;
  v_order_items jsonb := '[]'::jsonb;
  v_order_id uuid;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang tidak boleh kosong';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Jumlah produk tidak valid';
    end if;

    select * into v_product
    from public.products
    where id = (v_item->>'id')::uuid
    for update;

    if not found then
      raise exception 'Produk tidak ditemukan';
    end if;
    if v_product.stock < v_quantity then
      raise exception 'Stok % tidak mencukupi', v_product.name;
    end if;

    update public.products set stock = stock - v_quantity where id = v_product.id;
    v_total := v_total + (v_product.price * v_quantity);
    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
      'id', v_product.id, 'name', v_product.name, 'price', v_product.price,
      'quantity', v_quantity, 'size_ml', v_product.size_ml
    ));
  end loop;

  insert into public.orders (user_id, user_email, items, total, status, shipping_name, shipping_phone, shipping_address)
  values (auth.uid(), p_user_email, v_order_items, v_total, 'pending', p_shipping_name, p_shipping_phone, p_shipping_address)
  returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(jsonb, text, text, text, text) from public;
grant execute on function public.place_order(jsonb, text, text, text, text) to anon, authenticated;

