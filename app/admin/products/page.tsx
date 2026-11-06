'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

type ProductForm = Omit<Product, 'id' | 'created_at' | 'img'>

const EMPTY: ProductForm = {
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
  const [form, setForm] = useState<ProductForm>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(`Produk tidak dapat dimuat: ${error.message}`)
      return
    }

    setProducts((data || []) as Product[])
  }, [supabase])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setModal(true) }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name ?? '', description: p.description ?? '', price: p.price ?? 0,
      image_url: p.image_url ?? '', category: p.category ?? 'Floral', stock: p.stock ?? 0,
      is_featured: p.is_featured ?? false, accord: p.accord ?? '', size_ml: p.size_ml ?? 50,
    })
    setModal(true)
  }

  const uploadImage = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Pilih file gambar (JPG, PNG, WEBP, atau GIF).')
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran gambar maksimal 5 MB.')

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `products/${crypto.randomUUID()}.${extension}`
    setUploading(true)
    const { error } = await supabase.storage.from('site-assets').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
    })
    setUploading(false)
    if (error) return toast.error(`Gagal mengunggah gambar: ${error.message}`)

    const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
    setForm((current) => ({ ...current, image_url: data.publicUrl }))
    toast.success('Gambar berhasil diunggah.')
  }

  const save = async () => {
    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim() || null,
      accord: form.accord.trim() || null,
      image_url: form.image_url.trim() || null,
    }

    if (!payload.name) return toast.error('Nama produk wajib diisi.')
    if (!Number.isFinite(payload.price) || payload.price < 0) return toast.error('Harga harus berupa angka nol atau lebih.')
    if (!Number.isInteger(payload.stock) || payload.stock < 0) return toast.error('Stok harus berupa bilangan bulat nol atau lebih.')
    if (!Number.isInteger(payload.size_ml) || payload.size_ml <= 0) return toast.error('Ukuran harus berupa bilangan bulat lebih dari nol.')

    setLoading(true)
    try {
      const { error } = editing
        ? await supabase.from('products').update(payload).eq('id', editing.id)
        : await supabase.from('products').insert(payload)

      if (error) {
        toast.error(`Gagal ${editing ? 'memperbarui' : 'menambahkan'} produk: ${error.message}`)
        return
      }

      toast.success(editing ? 'Produk diperbarui!' : 'Produk ditambahkan!')
      setModal(false)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select('id')

      if (error) {
        toast.error(`Gagal menghapus produk: ${error.message}`)
        return
      }
      if (!data?.length) {
        toast.error('Produk tidak terhapus. Pastikan akun ini memiliki akses admin.')
        return
      }

      setProducts((current) => current.filter((product) => product.id !== id))
      toast.success('Produk dihapus')
    } finally {
      setLoading(false)
    }
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
              <tr><td colSpan={7} className="px-6 py-16 text-center text-gris-clair text-sm">Belum ada produk. Klik &quot;Tambah Produk&quot; untuk mulai.</td></tr>
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
                    <button onClick={() => del(p.id)} disabled={loading} aria-label={`Hapus ${p.name}`} className="text-gris-clair hover:text-red-400 transition-colors disabled:opacity-50"><Trash2 size={14} /></button>
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
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof Pick<ProductForm, 'name' | 'accord' | 'image_url'>]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-dark" />
                </div>
              ))}

              <div>
                <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-1.5">Gambar Produk</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-or/30 px-4 py-5 text-xs text-gris-clair transition-colors hover:border-or hover:text-or">
                  <Upload size={16} />
                  <span>{uploading ? 'Mengunggah gambar...' : 'Pilih gambar dari perangkat'}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadImage(event.target.files?.[0])} disabled={loading || uploading} className="sr-only" />
                </label>
                <p className="mt-1.5 text-xs text-gris-clair">JPG, PNG, WEBP, atau GIF hingga 5 MB.</p>
                {form.image_url && <img src={form.image_url} alt="Pratinjau produk" className="mt-3 h-28 w-full object-cover" />}
              </div>

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

            <button onClick={save} disabled={loading || uploading} className="btn-gold w-full justify-center flex mt-6 disabled:opacity-50">
              {uploading ? 'Mengunggah...' : loading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
