'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

type Order = {
  id: string
  created_at: string
  user_email: string
  status: string
  total: number
  items: any[]
  shipping_name: string
  shipping_phone: string
  shipping_address: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error(`Pesanan tidak dapat dimuat: ${error.message}`)
      setLoading(false)
      return
    }
    setOrders(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) {
      toast.error(`Status pesanan tidak dapat diperbarui: ${error.message}`)
      return
    }
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order))
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-blanc">Pesanan</h1>
        <p className="text-sm text-gris-clair mt-1">Kelola pesanan pelanggan</p>
      </div>

      {loading ? (
        <p className="text-gris-clair text-sm text-center py-16">Memuat...</p>
      ) : orders.length === 0 ? (
        <div className="bg-gris border border-or/10 p-16 text-center">
          <p className="text-gris-clair text-sm tracking-widest uppercase">Belum ada pesanan masuk</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
          <div className="min-w-0 flex-1 overflow-x-auto border border-or/10 bg-gris">
            <table className="w-full">
              <thead>
                <tr className="border-b border-or/10">
                  {['Tanggal', 'Pelanggan', 'Total', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-gris-clair whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-or/5 hover:bg-or/5 transition-colors cursor-pointer ${selected?.id === order.id ? 'bg-or/5' : ''}`}
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-6 py-4 text-xs text-gris-clair whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-blanc">{order.shipping_name}<br /><span className="text-xs text-gris-clair">{order.user_email}</span></td>
                    <td className="px-6 py-4 text-or font-display">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_COLORS[order.status] || 'text-gris-clair'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-noir border border-or/20 text-gris-clair text-xs px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="h-fit w-full border border-or/10 bg-gris p-6 lg:w-80">
              <h2 className="font-display text-lg text-blanc mb-4">Detail Pesanan</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gris-clair mb-1">Pelanggan</p>
                  <p className="text-blanc">{selected.shipping_name}</p>
                  <p className="text-gris-clair text-xs">{selected.user_email}</p>
                  <p className="text-gris-clair text-xs">{selected.shipping_phone}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gris-clair mb-1">Alamat</p>
                  <p className="text-blanc text-xs">{selected.shipping_address}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gris-clair mb-2">Item</p>
                  {selected.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-or/5">
                      <span className="text-blanc">{item.name} x{item.quantity}</span>
                      <span className="text-or">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gris-clair text-xs uppercase tracking-widest">Total</span>
                  <span className="text-or font-display">{formatPrice(selected.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
