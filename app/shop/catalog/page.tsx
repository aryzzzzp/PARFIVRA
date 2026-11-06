import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/shop/ProductCard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Product } from '@/types'

export const dynamic = 'force-dynamic'

// Fungsi untuk mengambil data produk
async function getProducts(category?: string): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient()

    for (const table of ['products', 'product']) {
      let query = supabase.from(table).select('*')

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (!error && data && data.length > 0) {
        return data as Product[]
      }
    }

    return []
  } catch (err) {
    console.error("Fetch Error:", err)
    return []
  }
}

const CATEGORIES = ['Semua', 'Floral', 'Woody', 'Oriental', 'Fresh', 'Gourmand']

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category || 'all'
  const products = await getProducts(category === 'all' ? undefined : category)

  return (
    <>
      <Navbar />
      <div className="pt-28 pb-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-eyebrow">Koleksi Lengkap</p>
          <h1 className="section-title text-5xl">Semua Parfum</h1>
        </div>

        {/* Filter */}
        <div className="flex gap-3 flex-wrap justify-center mb-12">
          {CATEGORIES.map((cat) => {
            const val = cat === 'Semua' ? 'all' : cat
            const active = category === val
            return (
              <a
                key={cat}
                href={`/shop/catalog?category=${val}`}
                className={`px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                  active
                    ? 'bg-or text-noir'
                    : 'border border-or/30 text-gris-clair hover:border-or hover:text-or'
                }`}
              >
                {cat}
              </a>
            )
          })}
        </div>

        {/* Grid Produk */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="font-display text-3xl text-gris-clair mb-4">Belum ada produk</p>
            <p className="text-sm text-gris-clair">Produk belum tersedia di kategori ini.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
