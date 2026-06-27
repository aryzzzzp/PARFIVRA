import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default function Footer() {
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6282247484376'
  const waLink = `https://wa.me/${waNumber}?text=Halo%20ParFivra,%20saya%20ingin%20bertanya%20tentang%20produk`

  return (
    <footer className="border-t border-or/10 bg-noir">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-2">
          <p className="font-display text-2xl tracking-[0.3em] text-or uppercase mb-4">ParFivra</p>
          <p className="text-sm text-gris-clair leading-relaxed max-w-xs">
            Parfum mewah Prancis, diracik dengan bahan terbaik dan cinta tulus sejak 2013.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 bg-[#25D366] text-white px-5 py-2.5 text-xs tracking-widest uppercase font-medium hover:bg-[#20bc5a] transition-colors"
          >
            <MessageCircle size={16} />
            Chat Admin WhatsApp
          </a>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase text-or mb-5">Koleksi</h4>
          <ul className="space-y-3 list-none">
            {['Semua Parfum', 'Edisi Terbatas', 'Hadiah & Set', 'Miniatur'].map((l) => (
              <li key={l}>
                <Link href="/shop/catalog" className="text-sm text-gris-clair hover:text-creme transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase text-or mb-5">Info</h4>
          <ul className="space-y-3 list-none">
            {['Tentang Kami', 'Cara Pemesanan', 'Pengiriman', 'Kebijakan Retur'].map((l) => (
              <li key={l}>
                <Link href="/" className="text-sm text-gris-clair hover:text-creme transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-xs text-gris-clair">© 2025 ParFivra Parfum. Seluruh hak cipta dilindungi.</p>
        <p className="text-xs text-gris-clair">Dibuat dengan ♥ di Indonesia</p>
      </div>
    </footer>
  )
}
