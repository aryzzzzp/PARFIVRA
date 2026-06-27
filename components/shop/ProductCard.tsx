'use client'

import { ShoppingBag, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Product } from '@/types'
import { useCartStore } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6282247484376'
  const productImage = product.image_url || product.img

  const handleAdd = () => {
    addItem(product)
    toast.success(`${product.name} ditambahkan ke keranjang`)
  }

  // Menggunakan 'description' karena 'size_ml' tidak ada di database
  const waMessage = `Halo ParFivra, saya tertarik dengan *${product.name}* (${product.description}) seharga ${formatPrice(product.price)}. Apakah masih tersedia?`
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`

  return (
    <div className="card-product group relative">
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-or scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {product.is_featured && (
        <p className="text-[10px] tracking-[0.2em] uppercase text-or mb-4">✦ Terlaris</p>
      )}

      <div className="w-full aspect-[3/4] bg-noir/50 mb-5 relative overflow-hidden">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 160" width="70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="42" y="12" width="16" height="5" rx="2" fill="#C9A84C" opacity="0.7" />
              <rect x="45" y="6" width="10" height="8" rx="3" fill="#A88A3A" />
              <rect x="20" y="17" width="60" height="135" rx="8" fill="#2A2A35" />
              <rect x="20" y="17" width="60" height="6" rx="3" fill="#C9A84C" opacity="0.5" />
              <rect x="20" y="146" width="60" height="6" rx="3" fill="#C9A84C" opacity="0.5" />
              <text x="50" y="92" fontFamily="serif" fontSize="7" fill="#C9A84C" textAnchor="middle" letterSpacing="3">RE</text>
            </svg>
          </div>
        )}
      </div>

      <h3 className="font-display text-xl text-blanc mb-1">{product.name}</h3>
      <p className="text-xs text-gris-clair mb-1 tracking-wide">{product.description}</p>
      <p className="font-display text-lg text-or mb-4">{formatPrice(product.price)}</p>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 border border-or/30 text-creme text-[10px] tracking-widest uppercase py-2.5 hover:bg-or hover:text-noir hover:border-or transition-all duration-300"
        >
          <ShoppingBag size={12} />
          Tambah
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-3 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300"
        >
          <MessageCircle size={14} />
        </a>
      </div>
    </div>
  )
}
