'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6282247484376'

  const orderViaWA = () => {
    const lines = items.map(
      (i) => `• ${i.product.name} (${i.product.size_ml}ml) x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`
    )
    const msg = `Halo ParFivra! Saya ingin memesan:\n\n${lines.join('\n')}\n\n*Total: ${formatPrice(total())}*\n\nMohon konfirmasi ketersediaan dan detail pengiriman. Terima kasih!`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      <Navbar />
      <div className="pt-28 pb-24 px-6 md:px-16 max-w-5xl mx-auto">
        <p className="section-eyebrow">Belanjaan Anda</p>
        <h1 className="section-title text-4xl mb-12">Keranjang</h1>

        {items.length === 0 ? (
          <div className="text-center py-32">
            <ShoppingBag size={48} className="text-gris-clair mx-auto mb-6" />
            <p className="font-display text-3xl text-gris-clair mb-4">Keranjang kosong</p>
            <p className="text-sm text-gris-clair mb-8">Temukan parfum sempurna untuk Anda</p>
            <Link href="/shop/catalog" className="btn-gold">
              Jelajahi Koleksi
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-5 p-5 bg-gris">
                  {/* Mini bottle */}
                  <div className="w-16 h-20 bg-noir flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 60 90" width="40" fill="none">
                      <rect x="23" y="6" width="14" height="4" rx="2" fill="#C9A84C" opacity="0.7" />
                      <rect x="10" y="10" width="40" height="75" rx="5" fill="#2A2A35" />
                      <rect x="10" y="10" width="40" height="4" rx="2" fill="#C9A84C" opacity="0.5" />
                      <text x="30" y="55" fontFamily="serif" fontSize="5" fill="#C9A84C" textAnchor="middle" letterSpacing="2">PARFIVRA</text>
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-lg text-blanc">{item.product.name}</h3>
                    <p className="text-xs text-gris-clair mt-0.5">{item.product.accord} · {item.product.size_ml}ml</p>
                    <p className="text-or font-display mt-2">{formatPrice(item.product.price)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-gris-clair hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-2 border border-or/20">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-gris-clair hover:text-or transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-gris-clair hover:text-or transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-gris-clair hover:text-red-400 transition-colors tracking-widest uppercase mt-4"
              >
                Kosongkan Keranjang
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gris p-8 h-fit">
              <h2 className="font-display text-xl text-blanc mb-6">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-6 border-b border-or/10 pb-6">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-gris-clair">{i.product.name} x{i.quantity}</span>
                    <span className="text-creme">{formatPrice(i.product.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-sm tracking-widest uppercase text-gris-clair">Total</span>
                <span className="font-display text-2xl text-or">{formatPrice(total())}</span>
              </div>

              <button
                onClick={orderViaWA}
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 text-sm tracking-widest uppercase font-medium hover:bg-[#20bc5a] transition-colors mb-3"
              >
                <MessageCircle size={16} />
                Pesan via WhatsApp
              </button>

              <p className="text-[10px] text-gris-clair text-center leading-relaxed">
                Admin kami akan konfirmasi ketersediaan dan detail pengiriman
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
