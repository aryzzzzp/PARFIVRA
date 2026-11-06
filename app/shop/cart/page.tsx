'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, Landmark, QrCode } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import toast from 'react-hot-toast'

type PaymentMethod = 'bank_transfer' | 'qris' | 'whatsapp'

const PAYMENT_METHODS: { id: PaymentMethod; label: string; detail: string; icon: typeof Landmark }[] = [
  { id: 'bank_transfer', label: 'Transfer bank', detail: 'Admin mengirim detail rekening setelah pesanan dikonfirmasi.', icon: Landmark },
  { id: 'qris', label: 'QRIS / e-wallet', detail: 'Admin mengirim instruksi pembayaran setelah pesanan dikonfirmasi.', icon: QrCode },
  { id: 'whatsapp', label: 'Konfirmasi WhatsApp', detail: 'Diskusikan ketersediaan dan cara pembayaran langsung dengan admin.', icon: MessageCircle },
]

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6282247484376'
  const supabase = createClient()

  const [form, setForm] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [loading, setLoading] = useState(false)

  const orderViaWA = async () => {
    if (!form.shipping_name.trim() || !form.shipping_phone.trim() || !form.shipping_address.trim()) {
      toast.error('Lengkapi data pengiriman dulu!')
      return
    }

    if (items.some((item) => item.product.stock <= 0 || item.quantity > item.product.stock)) {
      toast.error('Ada produk yang stoknya sudah tidak mencukupi. Perbarui keranjang terlebih dahulu.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const orderItems = items.map((item) => ({ id: item.product.id, quantity: item.quantity }))

    const { data: orderId, error } = await supabase.rpc('place_order', {
      p_items: orderItems,
      p_user_email: user?.email || null,
      p_shipping_name: form.shipping_name.trim(),
      p_shipping_phone: form.shipping_phone.trim(),
      p_shipping_address: form.shipping_address.trim(),
    })

    if (error) {
      console.error(error)
      toast.error(`Gagal menyimpan pesanan: ${error.message}`)
      setLoading(false)
      return
    }

    if (!orderId) {
      toast.error('Pesanan belum dapat dikonfirmasi. Silakan coba kembali.')
      setLoading(false)
      return
    }

    const lines = items.map(
      (i) => `• ${i.product.name} (${i.product.size_ml}ml) x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`
    )
    const paymentLabel = PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label || 'Transfer bank'
    const paymentInstructions = paymentMethod === 'bank_transfer'
      ? 'Mohon kirim detail rekening dan petunjuk transfer.'
      : paymentMethod === 'qris'
        ? 'Mohon kirim QRIS atau instruksi pembayaran e-wallet.'
        : 'Mohon konfirmasi ketersediaan produk dan langkah selanjutnya.'
    const msg = `Halo ParFivra! Saya ingin mengonfirmasi pesanan *${String(orderId).slice(0, 8).toUpperCase()}*:\n\n${lines.join('\n')}\n\n*Total: ${formatPrice(total())}*\n*Metode pembayaran: ${paymentLabel}*\n\nNama: ${form.shipping_name}\nNo HP: ${form.shipping_phone}\nAlamat: ${form.shipping_address}\n\n${paymentInstructions}\nMohon konfirmasi. Terima kasih!`

    toast.success('Pesanan tersimpan!')
    clearCart()
    setLoading(false)
    window.location.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
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
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-5 p-5 bg-gris">
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
                    <button onClick={() => removeItem(item.product.id)} className="text-gris-clair hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-2 border border-or/20">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 text-gris-clair hover:text-or transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} aria-label={`Tambah jumlah ${item.product.name}`} className="px-2 py-1 text-gris-clair hover:text-or transition-colors disabled:cursor-not-allowed disabled:opacity-30">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="text-xs text-gris-clair hover:text-red-400 transition-colors tracking-widest uppercase mt-4">
                Kosongkan Keranjang
              </button>
            </div>

            <div className="bg-gris p-8 h-fit space-y-6">
              <h2 className="font-display text-xl text-blanc">Ringkasan Pesanan</h2>

              <div className="space-y-3 border-b border-or/10 pb-6">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-gris-clair">{i.product.name} x{i.quantity}</span>
                    <span className="text-creme">{formatPrice(i.product.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm tracking-widest uppercase text-gris-clair">Total</span>
                <span className="font-display text-2xl text-or">{formatPrice(total())}</span>
              </div>

              <div className="space-y-3 border-t border-or/10 pt-6">
                <p className="text-[10px] tracking-widest uppercase text-gris-clair">Data Pengiriman</p>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={form.shipping_name}
                  onChange={(e) => setForm({ ...form, shipping_name: e.target.value })}
                  className="input-dark w-full"
                />
                <input
                  type="text"
                  placeholder="No. WhatsApp"
                  value={form.shipping_phone}
                  onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })}
                  className="input-dark w-full"
                />
                <textarea
                  placeholder="Alamat Lengkap"
                  rows={3}
                  value={form.shipping_address}
                  onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                  className="input-dark w-full resize-none"
                />
              </div>

              <fieldset className="space-y-3 border-t border-or/10 pt-6">
                <legend className="text-[10px] tracking-widest uppercase text-gris-clair">Metode pembayaran</legend>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(({ id, label, detail, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      aria-pressed={paymentMethod === id}
                      className={`flex w-full items-start gap-3 border p-3 text-left transition-colors ${paymentMethod === id ? 'border-or bg-or/10' : 'border-white/10 hover:border-or/40'}`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center ${paymentMethod === id ? 'bg-or text-noir' : 'bg-noir text-gris-clair'}`}><Icon size={15} /></span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium text-creme">{label}</span>
                        <span className="mt-1 block text-[10px] leading-4 text-gris-clair">{detail}</span>
                      </span>
                      <span className={`ml-auto mt-2 h-3 w-3 shrink-0 rounded-full border ${paymentMethod === id ? 'border-or bg-or ring-2 ring-or/20' : 'border-gris-clair'}`} />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] leading-4 text-gris-clair">Pembayaran dikonfirmasi manual oleh admin melalui WhatsApp. Tidak ada pembayaran otomatis yang diproses di situs ini.</p>
              </fieldset>

              <button
                onClick={orderViaWA}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 text-sm tracking-widest uppercase font-medium hover:bg-[#20bc5a] transition-colors disabled:opacity-50"
              >
                <MessageCircle size={16} />
                {loading ? 'Menyimpan...' : 'Pesan via WhatsApp'}
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
