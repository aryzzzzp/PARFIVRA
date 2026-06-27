import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient()

    for (const table of ['products', 'product']) {
      const featured = await supabase
        .from(table)
        .select('*')
        .eq('is_featured', true)
        .limit(3)

      if (!featured.error && featured.data && featured.data.length > 0) {
        return featured.data as Product[]
      }

      const fallback = await supabase
        .from(table)
        .select('*')
        .limit(3)

      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        return fallback.data as Product[]
      }
    }

    return []
  } catch (err) {
    console.error("Unexpected error:", err)
    return []
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6282247484376'
  const waMessage = 'Halo ParFivra, saya ingin konsultasi dan memesan parfum.'
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="min-h-screen grid md:grid-cols-2 items-center px-6 md:px-16 pt-24 pb-16 gap-12 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-3/4 bg-or/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="section-eyebrow">Koleksi Musim Gugur 2025</p>
          <h1 className="section-title text-5xl md:text-6xl mb-6">
            Seni dalam<br />Sebotol{' '}
            <em className="text-or font-light italic font-display">Aroma</em>
          </h1>
          <p className="text-sm text-gris-clair leading-relaxed max-w-sm mb-8">
            Setiap tetes adalah cerita. Racikan tangan maestro parfumeur dari Grasse,
            menghadirkan kemewahan yang tak terucapkan.
          </p>
          <div className="flex gap-4 items-center">
            <Link href="/shop/catalog" className="btn-gold">Jelajahi Koleksi</Link>
            <Link href="/shop/catalog" className="btn-ghost">Temukan Parfum Anda →</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-or/20 bg-gris/40 overflow-hidden py-4">
        <div
          className="flex w-max gap-10 whitespace-nowrap text-[11px] uppercase tracking-[0.35em] text-or"
          style={{ animation: 'marquee 24s linear infinite' }}
        >
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="flex gap-10">
              {['ParFivra', 'Extrait de Parfum', 'Handcrafted Scents', 'Luxury Collection', 'Signature Aroma'].map((text) => (
                <span key={`${group}-${text}`}>{text}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      {/* Jika produk masih tidak muncul, cek di console browser apakah ada error */}
      <section className="px-6 md:px-16 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="section-eyebrow">Koleksi Pilihan</p>
            <h2 className="section-title text-4xl">
              {featured.length > 0 ? "Parfum Terlaris" : "Memuat Koleksi..."}
            </h2>
          </div>
          <Link href="/shop/catalog" className="text-xs tracking-widest uppercase text-or hover:text-or-pale transition-colors underline underline-offset-4">
            Lihat Semua →
          </Link>
        </div>
        
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-gris-clair">Belum ada produk unggulan yang ditampilkan.</p>
        )}
      </section>

      <section className="border-y border-[#25D366]/25 bg-[#102016]/60 overflow-hidden py-4">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          aria-label="Konsultasi dan pesan parfum lewat WhatsApp"
        >
          <div
            className="flex w-max gap-10 whitespace-nowrap text-[11px] uppercase tracking-[0.35em] text-[#25D366]"
            style={{ animation: 'marquee 22s linear infinite' }}
          >
            {Array.from({ length: 2 }).map((_, group) => (
              <div key={group} className="flex gap-10">
                {['WhatsApp Order', 'Konsultasi Aroma', 'Tanya Stok Parfum', 'Pesan Sekarang', 'Fast Response'].map((text) => (
                  <span key={`${group}-${text}`}>{text}</span>
                ))}
              </div>
            ))}
          </div>
        </a>
      </section>

      <Footer />
    </>
  )
}
