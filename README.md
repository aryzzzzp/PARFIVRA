# ParFivra Parfum — Setup Guide

## Langkah 1: Install dependencies

```bash
cd parfivra
npm install
```

## Langkah 2: Setup Supabase

1. Buka https://app.supabase.com dan buat project baru
2. Buka **SQL Editor** dan paste seluruh isi file `supabase/schema.sql`
3. Klik **Run** — semua tabel akan dibuat otomatis

## Langkah 3: Isi .env.local

Buka file `.env.local` dan isi dengan data dari Supabase:
- Project Settings → API → Project URL
- Project Settings → API → anon/public key
- Nomor WhatsApp admin (tanpa tanda +)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
NEXT_PUBLIC_WA_NUMBER=6282247484376

```

## Langkah 4: Jalankan

```bash
npm run dev
```

Buka http://localhost:3000

---

## Membuat Akun Admin

1. Daftar akun biasa lewat `/auth/register`
2. Buka Supabase SQL Editor, jalankan:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'emailanda@gmail.com'
);
```

3. Login dan akses `/admin`

---

## Struktur Halaman

| URL | Keterangan |
|-----|------------|
| `/` | Beranda dengan hero & produk featured |
| `/shop/catalog` | Katalog semua produk |
| `/shop/cart` | Keranjang belanja |
| `/auth/login` | Halaman login |
| `/auth/register` | Halaman daftar |
| `/admin` | Dashboard admin |
| `/admin/products` | Kelola produk |
| `/admin/orders` | Lihat pesanan |

## Fitur

- Katalog produk dengan filter kategori
- Keranjang belanja (tersimpan di browser)
- Order via WhatsApp dengan detail otomatis
- Login / Register dengan Supabase Auth
- Dashboard admin: statistik, kelola produk, lihat pesanan
- Role-based access: admin vs customer
