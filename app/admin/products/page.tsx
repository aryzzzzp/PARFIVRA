'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY: Omit<Product, 'id' | 'created_at'> = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  category: 'Floral',
  stock: 0,
  is_featured: false,
  accord: '',
  size_ml: 50,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, description: p.description, price: p.price, image_url: p.image_url, category: p.category, stock: p.stock, is_featured: p.is_featured, accord: p.accord, size_ml: p.size_ml }); setModal(true) }

  const save = async () => {
    setLoading(true)
    if (editing) {
      const { error } = await supabase.from('products').update(form).eq('id', editing.id)
      if (error) toast.error('Gagal memperbarui')
      else toast.success('Produk diperbarui!')
    } else {
      const { error } = await supabase.from('products').insert(form)
      if (error) toast.error('Gagal menambahkan')
      else toast.success('Produk ditambahkan!')
    }
    setLoading(false)
    setModal(false)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Produk dihapus')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-blanc">Produk</h1>
          <p className="text-sm text-gris-clair mt-1">Kelola katalog parfum Anda</p>
        </div>
        <button onClick={openNew} className="btn-gold flex items-center gap-2">
          <Plus size={14} /> Tambah Produk
        </button>
      </div>

      <div className="bg-gris border border-or/10 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-or/10">
              {['Nama', 'Kategori', 'Accord', 'Stok', 'Harga', 'Featured', 'Aksi'].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-gris-clair whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-gris-clair text-sm">Belum ada produk. Klik "Tambah Produk" untuk mulai.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-or/5 hover:bg-or/5 transition-colors">
                <td className="px-6 py-4 font-display text-blanc">{p.name}</td>
                <td className="px-6 py-4 text-xs text-gris-clair">{p.category}</td>
                <td className="px-6 py-4 text-xs text-gris-clair">{p.accord}</td>
                <td className="px-6 py-4 text-sm text-creme">{p.stock}</td>
                <td className="px-6 py-4 text-or font-display">{formatPrice(p.price)}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${p.is_featured ? 'bg-or/20 text-or' : 'text-gris-clair'}`}>
                    {p.is_featured ? 'Ya' : '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(p)} className="text-gris-clair hover:text-or transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => del(p.id)} className="text-gris-clair hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-gris w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl text-blanc">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setModal(false)} className="text-gris-clair hover:text-or"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Nama Produk', key: 'name', type: 'text' },
                { label: 'Accord (mis: Rose · Jasmine)', key: 'accord', type: 'text' },
                { label: 'URL Gambar', key: 'image_url', type: 'url' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-dark" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">Harga (Rp)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">Stok</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} className="input-dark" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">Ukuran (ml)</label>
                  <input type="number" value={form.size_ml} onChange={(e) => setForm({ ...form, size_ml: +e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-dark">
                    {['Floral', 'Woody', 'Oriental', 'Fresh', 'Gourmand'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark resize-none" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 accent-[#C9A84C]" />
                <span className="text-xs text-gris-clair tracking-widest uppercase">Tampilkan di Beranda (Featured)</span>
              </label>
            </div>

            <button onClick={save} disabled={loading} className="btn-gold w-full justify-center flex mt-6 disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
