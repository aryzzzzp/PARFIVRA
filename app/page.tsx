import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSiteContent, defaultHomeContent } from '@/lib/site-content'
import { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'

export const dynamic = 'force-dynamic'

const topTickerLabels = ['ParFivra', 'Extrait de Parfum', 'Handcrafted Scents', 'Luxury Collection', 'Signature Aroma']
const bottomTickerLabels = ['Hubungi Kami', 'Koleksi Parfum', 'Pesan Sekarang', 'Layanan WhatsApp', 'ParFivra']

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.from('products').select('*').eq('is_featured', true).limit(3)
    if (data?.length) return data as Product[]

    const fallback = await supabase.from('products').select('*').limit(3)
    return (fallback.data || []) as Product[]
  } catch {
    return []
  }
}

function MarqueeDivider({ labels }: { labels: string[] }) {
  return (
    <section className="border-y border-or/20 bg-gris/40 overflow-hidden py-4">
      <div className="flex w-max whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-or will-change-transform" style={{ animation: 'marquee 20s linear infinite' }}>
        {Array.from({ length: 4 }).map((_, group) => (
          <div key={group} className="flex shrink-0 gap-6 pr-6">
            {labels.map((text) => <span key={`${group}-${text}`}>{text}</span>)}
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function HomePage() {
  const [featured, content] = await Promise.all([
    getFeaturedProducts(),
    getSiteContent('home', defaultHomeContent),
  ])

  return (
    <>
      <Navbar />
      <section className="min-h-screen grid md:grid-cols-2 items-center px-6 md:px-16 pt-24 pb-16 gap-12 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-3/4 bg-or/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="section-eyebrow">{content.eyebrow}</p>
          <h1 className="section-title text-5xl md:text-6xl mb-6">
            {content.title}<br /><em className="text-or font-light italic font-display">{content.accent}</em>
          </h1>
          <p className="text-sm text-gris-clair leading-relaxed max-w-sm mb-8">{content.description}</p>
          <div className="flex gap-4 items-center">
            <Link href="/shop/catalog" className="btn-gold">Jelajahi Koleksi</Link>
            <Link href="/about" className="btn-ghost">Kenali ParFivra →</Link>
          </div>
        </div>
      </section>
      <MarqueeDivider labels={topTickerLabels} />
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="section-eyebrow">{content.featuredEyebrow}</p>
            <h2 className="section-title text-4xl">{featured.length ? content.featuredTitle : 'Koleksi ParFivra'}</h2>
          </div>
          <Link href="/shop/catalog" className="text-xs tracking-widest uppercase text-or hover:text-or-pale transition-colors underline underline-offset-4">Lihat Semua →</Link>
        </div>
        {featured.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        ) : <p className="text-gris-clair">Belum ada produk unggulan yang ditampilkan.</p>}
      </section>
      <MarqueeDivider labels={bottomTickerLabels} />
      <Footer />
    </>
  )
}
