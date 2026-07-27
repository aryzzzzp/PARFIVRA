'use client'

import { ShoppingBag, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Product } from '@/types'
import { useCartStore } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const addItem = useCartStore((s) => s.addItem)
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6282247484376'
  const productImage = product.image_url || product.img
  const outOfStock = product.stock <= 0

  const handleAdd = () => {
    if (addItem(product)) toast.success(`${product.name} ditambahkan ke keranjang`)
    else toast.error(`Stok ${product.name} tidak mencukupi.`)
  }

  const waMessage = `Halo ParFivra, saya tertarik dengan *${product.name}* (${product.description || 'parfum pilihan'}) seharga ${formatPrice(product.price)}. Apakah masih tersedia?`
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`

  return <article className={`card-product group relative ${compact ? 'p-4' : 'p-6'}`}>
    <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-or transition-transform duration-300 group-hover:scale-x-100" />
    <div className={`mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] ${product.is_featured ? 'text-or' : 'text-gris-clair'}`}><span>{product.is_featured ? '✦ Terlaris' : product.category}</span><span className={outOfStock ? 'text-red-400' : 'text-gris-clair'}>{outOfStock ? 'Habis' : `${product.stock} stok`}</span></div>
    <div className={`relative mb-4 w-full overflow-hidden bg-noir/50 ${compact ? 'aspect-square' : 'aspect-[3/4]'}`}>
      {productImage ? <Image src={productImage} alt={product.name} fill unoptimized sizes={compact ? '(min-width: 1024px) 18vw, (min-width: 640px) 40vw, 90vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'} className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center"><svg viewBox="0 0 100 160" width="58" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="42" y="12" width="16" height="5" rx="2" fill="#C9A84C" opacity=".7" /><rect x="45" y="6" width="10" height="8" rx="3" fill="#A88A3A" /><rect x="20" y="17" width="60" height="135" rx="8" fill="#2A2A35" /><rect x="20" y="17" width="60" height="6" rx="3" fill="#C9A84C" opacity=".5" /><text x="50" y="92" fontFamily="serif" fontSize="7" fill="#C9A84C" textAnchor="middle" letterSpacing="3">PF</text></svg></div>}
    </div>
    <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-display text-blanc`}>{product.name}</h3>
    <p className="mt-1 h-8 overflow-hidden text-xs leading-4 text-gris-clair">{product.description || 'Parfum pilihan ParFivra.'}</p>
    <p className="mb-3 mt-2 font-display text-lg text-or">{formatPrice(product.price)}</p>
    <div className="flex gap-2"><button onClick={handleAdd} disabled={outOfStock} className="flex flex-1 items-center justify-center gap-2 border border-or/30 py-2 text-[10px] uppercase tracking-widest text-creme transition-all duration-300 hover:border-or hover:bg-or hover:text-noir disabled:cursor-not-allowed disabled:border-white/10 disabled:text-gris-clair disabled:hover:bg-transparent"><ShoppingBag size={12} />{outOfStock ? 'Habis' : 'Tambah'}</button><a href={waLink} target="_blank" rel="noopener noreferrer" aria-label={`Tanya ${product.name} lewat WhatsApp`} className="flex items-center justify-center border border-[#25D366]/40 px-3 text-[#25D366] transition-all duration-300 hover:bg-[#25D366] hover:text-white"><MessageCircle size={14} /></a></div>
  </article>
}
