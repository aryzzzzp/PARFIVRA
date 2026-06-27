import { createServerSupabaseClient } from '@/lib/supabase-server'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const [{ count: productCount }, { count: orderCount }, { count: userCount }] =
    await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

  const stats = [
    { label: 'Total Produk', value: productCount ?? 0, icon: Package, color: 'text-or' },
    { label: 'Total Pesanan', value: orderCount ?? 0, icon: ShoppingBag, color: 'text-green-400' },
    { label: 'Total Pengguna', value: userCount ?? 0, icon: Users, color: 'text-blue-400' },
  ]

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 className="font-display text-3xl text-blanc mb-2">Dashboard</h1>
      <p className="text-sm text-gris-clair mb-10">Selamat datang di panel admin ParFivra</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-gris p-6 border border-or/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-widest uppercase text-gris-clair">{s.label}</p>
              <s.icon size={18} className={s.color} />
            </div>
            <p className={`font-display text-4xl font-light ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-gris border border-or/10">
        <div className="p-6 border-b border-or/10">
          <h2 className="font-display text-xl text-blanc">Pesanan Terbaru</h2>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-or/10">
                {['ID', 'Pelanggan', 'Total', 'Status', 'Tanggal'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-gris-clair">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-or/5 hover:bg-or/5 transition-colors">
                  <td className="px-6 py-4 text-xs text-gris-clair font-mono">{o.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-creme">{o.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-or font-display">{formatPrice(o.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                      o.status === 'delivered' ? 'bg-green-900/30 text-green-400' :
                      o.status === 'processing' ? 'bg-or/20 text-or' :
                      o.status === 'cancelled' ? 'bg-red-900/30 text-red-400' :
                      'bg-gris-clair/20 text-gris-clair'
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gris-clair">
                    {new Date(o.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gris-clair text-sm">Belum ada pesanan</div>
        )}
      </div>
    </div>
  )
}
