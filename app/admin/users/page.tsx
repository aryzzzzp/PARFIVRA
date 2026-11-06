'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Users, ShoppingBag, UserRound, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

type Profile = {
  id: string
  full_name: string | null
  role: string | null
  created_at: string | null
}

type UserOrder = {
  user_id: string | null
  user_email: string | null
  total: number
  status: string
  created_at: string
  shipping_name: string
}

type Customer = Profile & {
  email: string
  orders: UserOrder[]
  spent: number
}

const dateLabel = (value: string) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function AdminUsersPage() {
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'customer' | 'admin'>('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }),
      supabase.from('orders').select('user_id, user_email, total, status, created_at, shipping_name').order('created_at', { ascending: false }),
    ])

    if (profilesError) {
      toast.error(`Data pelanggan tidak dapat dimuat: ${profilesError.message}`)
      setLoading(false)
      return
    }
    if (ordersError) toast.error(`Riwayat pesanan tidak dapat dimuat: ${ordersError.message}`)

    const ordersByUser = new Map<string, UserOrder[]>()
    for (const order of (orders || []) as UserOrder[]) {
      if (!order.user_id) continue
      ordersByUser.set(order.user_id, [...(ordersByUser.get(order.user_id) || []), order])
    }

    const rows = ((profiles || []) as Profile[]).map((profile) => {
      const userOrders = ordersByUser.get(profile.id) || []
      return {
        ...profile,
        email: userOrders.find((order) => order.user_email)?.user_email || '',
        orders: userOrders,
        spent: userOrders.reduce((sum, order) => order.status === 'cancelled' ? sum : sum + (order.total || 0), 0),
      }
    })
    setCustomers(rows)
    setSelectedId((current) => current && rows.some((row) => row.id === current) ? current : null)
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const filteredCustomers = customers.filter((customer) => {
    const matchesRole = filter === 'all' || customer.role === filter
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [customer.full_name, customer.email, customer.id].some((value) => value?.toLowerCase().includes(query))
    return matchesRole && matchesSearch
  })
  const selected = customers.find((customer) => customer.id === selectedId)
  const customerCount = customers.filter((customer) => customer.role !== 'admin').length
  const orderCount = customers.reduce((sum, customer) => sum + customer.orders.length, 0)

  return <div className="mx-auto max-w-7xl">
    <div className="mb-7">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7a36]">Workspace / Direktori</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#202534] md:text-3xl">Pelanggan</h1>
          <p className="mt-2 text-sm text-[#717b8b]">Profil pengguna dan aktivitas pesanan dari data ParFivra.</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg border border-[#dfe3e9] bg-white px-4 py-2.5 text-xs font-semibold text-[#596273] transition-colors hover:bg-[#f8f9fb]">Muat ulang</button>
      </div>
    </div>

    <div className="mb-6 grid gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-4 rounded-xl border border-[#e7e9ed] bg-white p-5 shadow-sm">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f7f3e9] text-[#8b6a24]"><Users size={20} /></span>
        <div><p className="text-xs text-[#8a92a0]">Akun pelanggan</p><p className="mt-1 text-2xl font-semibold text-[#303746]">{customerCount}</p></div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-[#e7e9ed] bg-white p-5 shadow-sm">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf4f2] text-[#41806e]"><ShoppingBag size={20} /></span>
        <div><p className="text-xs text-[#8a92a0]">Pesanan terkait akun</p><p className="mt-1 text-2xl font-semibold text-[#303746]">{orderCount}</p></div>
      </div>
    </div>

    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-xl border border-[#e7e9ed] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#eef0f3] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a0ad]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, atau ID..." className="w-full rounded-lg border border-[#dfe3e9] py-2.5 pl-9 pr-3 text-sm text-[#303746] outline-none focus:border-[#b69a5b]" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded-lg border border-[#dfe3e9] bg-white px-3 py-2.5 text-xs text-[#596273] outline-none focus:border-[#b69a5b]" aria-label="Filter peran pengguna">
            <option value="all">Semua peran</option>
            <option value="customer">Pelanggan</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead className="bg-[#fafbfc]">
              <tr>{['Pengguna', 'Bergabung', 'Pesanan', 'Akumulasi', 'Peran'].map((heading) => <th key={heading} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a92a0]">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f3]">
              {loading ? <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-[#8a92a0]">Memuat data pengguna…</td></tr>
                : filteredCustomers.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-[#8a92a0]">Tidak ada pengguna yang cocok.</td></tr>
                  : filteredCustomers.map((customer) => (
                    <tr key={customer.id} onClick={() => setSelectedId(customer.id)} className={`cursor-pointer transition-colors hover:bg-[#faf9f5] ${selectedId === customer.id ? 'bg-[#faf9f5]' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#303746]">{customer.full_name || 'Nama belum diisi'}</div>
                        <div className="mt-1 text-xs text-[#8a92a0]">{customer.email || `${customer.id.slice(0, 8)}…`}</div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[#687181]">{customer.created_at ? dateLabel(customer.created_at) : '—'}</td>
                      <td className="px-5 py-4 text-sm text-[#596273]">{customer.orders.length}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#596273]">{formatPrice(customer.spent)}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${customer.role === 'admin' ? 'bg-[#f5f0e5] text-[#8b6a24]' : 'bg-[#edf4f2] text-[#41806e]'}`}>{customer.role || 'customer'}</span></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#eef0f3] px-5 py-3 text-xs text-[#8a92a0]">{filteredCustomers.length} dari {customers.length} akun</div>
      </section>

      <aside className="rounded-xl border border-[#e7e9ed] bg-white shadow-sm">
        {selected ? <>
          <div className="flex items-start justify-between border-b border-[#eef0f3] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2ead8] text-[#8b6a24]"><UserRound size={18} /></span>
              <div><h2 className="text-sm font-semibold text-[#303746]">{selected.full_name || 'Nama belum diisi'}</h2><p className="mt-1 break-all text-xs text-[#8a92a0]">{selected.email || 'Email tidak tersedia di data pesanan'}</p></div>
            </div>
            <button onClick={() => setSelectedId(null)} aria-label="Tutup detail pengguna" className="rounded-md p-1 text-[#98a0ad] hover:bg-[#f4f5f7]"><X size={16} /></button>
          </div>
          <div className="space-y-4 p-5">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#98a0ad]">ID pengguna</p><p className="mt-1 break-all font-mono text-xs text-[#596273]">{selected.id}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#f8f9fb] p-3"><p className="text-[10px] text-[#8a92a0]">Bergabung</p><p className="mt-1 text-xs font-medium text-[#596273]">{selected.created_at ? dateLabel(selected.created_at) : '—'}</p></div>
              <div className="rounded-lg bg-[#f8f9fb] p-3"><p className="text-[10px] text-[#8a92a0]">Total pesanan</p><p className="mt-1 text-xs font-medium text-[#596273]">{selected.orders.length}</p></div>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold text-[#596273]">Pesanan terbaru</h3>
              {selected.orders.length ? <div className="space-y-2">{selected.orders.slice(0, 5).map((order) => (
                <div key={`${order.created_at}-${order.total}`} className="flex items-center justify-between gap-3 rounded-lg border border-[#eef0f3] p-3">
                  <div><p className="text-xs font-medium text-[#596273]">{dateLabel(order.created_at)}</p><p className="mt-1 text-[10px] capitalize text-[#8a92a0]">{order.status}</p></div>
                  <p className="whitespace-nowrap text-xs font-semibold text-[#8b6a24]">{formatPrice(order.total)}</p>
                </div>
              ))}</div> : <p className="rounded-lg bg-[#f8f9fb] p-4 text-xs text-[#8a92a0]">Belum ada pesanan untuk akun ini.</p>}
            </div>
          </div>
        </> : <div className="px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f5f7] text-[#8a92a0]"><UserRound size={19} /></span>
          <p className="mt-3 text-sm font-medium text-[#596273]">Pilih pengguna</p>
          <p className="mt-1 text-xs leading-5 text-[#8a92a0]">Pilih salah satu baris untuk melihat profil dan riwayat pesanan.</p>
        </div>}
      </aside>
    </div>
    <p className="mt-4 text-[11px] leading-5 text-[#9299a5]">Alamat email ditampilkan jika tersedia pada pesanan. Data pengguna di sini bersifat baca-saja sesuai akses database yang tersedia.</p>
  </div>
}
