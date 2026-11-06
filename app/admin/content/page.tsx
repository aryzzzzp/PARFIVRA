'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { AboutContent, defaultAboutContent, defaultHomeContent, HomeContent } from '@/lib/site-content-defaults'
<<<<<<< HEAD
import { FileText, Globe2, ImagePlus, Save } from 'lucide-react'
=======
>>>>>>> 92f35dd30afc58fd023cebb491f1a4b50765c8e9

type PageKey = 'home' | 'about'

function Field({ label, value, onChange, multiline = false, hint }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string }) {
<<<<<<< HEAD
  return <div><label className="mb-2 block text-xs font-medium text-[#555f70]">{label}</label>{multiline ? <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} className="input-dark resize-y rounded-lg" /> : <input value={value} onChange={(e) => onChange(e.target.value)} className="input-dark rounded-lg" />}{hint && <p className="mt-2 text-xs text-[#8a92a0]">{hint}</p>}</div>
=======
  return <div><label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gris-clair">{label}</label>{multiline ? <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} className="input-dark resize-y" /> : <input value={value} onChange={(e) => onChange(e.target.value)} className="input-dark" />}{hint && <p className="mt-1.5 text-xs text-gris-clair">{hint}</p>}</div>
>>>>>>> 92f35dd30afc58fd023cebb491f1a4b50765c8e9
}

export default function AdminContentPage() {
  const supabase = useMemo(() => createClient(), [])
  const [home, setHome] = useState<HomeContent>(defaultHomeContent)
  const [about, setAbout] = useState<AboutContent>(defaultAboutContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<PageKey | null>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('site_pages').select('slug, content').in('slug', ['home', 'about'])
    if (error && error.code !== '42P01') toast.error(`Konten tidak dapat dimuat: ${error.message}`)
    for (const page of data || []) {
      if (page.slug === 'home') setHome({ ...defaultHomeContent, ...(page.content as Partial<HomeContent>) })
      if (page.slug === 'about') setAbout({ ...defaultAboutContent, ...(page.content as Partial<AboutContent>) })
    }
    setLoading(false)
  }, [supabase])
  useEffect(() => { load() }, [load])

  const save = async (slug: PageKey, content: HomeContent | AboutContent) => {
    setSaving(slug)
    const { error } = await supabase.from('site_pages').upsert({ slug, content, updated_at: new Date().toISOString() })
    setSaving(null)
    if (error) return toast.error(error.code === '42P01' ? 'Tabel konten belum tersedia. Jalankan pembaruan schema.sql di Supabase.' : `Gagal menyimpan: ${error.message}`)
    toast.success(`Konten ${slug === 'home' ? 'Beranda' : 'Tentang Kami'} diperbarui.`)
  }
  const setHomeValue = (key: keyof HomeContent, value: string) => setHome((current) => ({ ...current, [key]: value }))
  const setAboutValue = (key: keyof AboutContent, value: string) => setAbout((current) => ({ ...current, [key]: value }))

  const uploadAboutImage = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Pilih file gambar (JPG, PNG, WEBP, atau GIF).')
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran gambar maksimal 5 MB.')

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `about/${crypto.randomUUID()}.${extension}`
    setUploading(true)
    const { error } = await supabase.storage.from('site-assets').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
    })
    setUploading(false)
    if (error) return toast.error(`Gagal mengunggah gambar: ${error.message}`)

    const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
    setAboutValue('imageUrl', data.publicUrl)
    toast.success('Gambar berhasil diunggah. Klik Simpan Tentang Kami untuk menerapkannya.')
  }
<<<<<<< HEAD
  if (loading) return <div className="max-w-6xl animate-pulse space-y-5"><div className="h-8 w-56 rounded bg-[#e6e9ee]" /><div className="h-4 w-80 rounded bg-[#e6e9ee]" /><div className="h-72 rounded-xl bg-white" /></div>

  const sectionClass = 'overflow-hidden rounded-xl border border-[#e7e9ed] bg-white shadow-sm'
  const sectionHeaderClass = 'flex items-center gap-3 border-b border-[#eef0f3] px-5 py-5 md:px-7'

  return <div className="mx-auto max-w-6xl">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7a36]">Workspace / Pengaturan situs</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#202534] md:text-3xl">Konten situs</h1>
        <p className="mt-2 text-sm text-[#717b8b]">Kelola materi yang ditampilkan pada halaman publik ParFivra.</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-[#e7e9ed] bg-white px-3 py-2 text-xs text-[#687181]">
        <Globe2 size={15} className="text-[#8b6a24]" /> Beranda & Tentang Kami
      </div>
    </div>

    <section className={`${sectionClass} mb-6`}>
      <div className={sectionHeaderClass}>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7f3e9] text-[#8b6a24]"><FileText size={18} /></span>
        <div><h2 className="text-base font-semibold text-[#303746]">Beranda</h2><p className="mt-1 text-xs text-[#8a92a0]">Teks utama dan koleksi unggulan situs.</p></div>
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-7">
        <Field label="Label atas" value={home.eyebrow} onChange={(value) => setHomeValue('eyebrow', value)} />
        <Field label="Kata aksen" value={home.accent} onChange={(value) => setHomeValue('accent', value)} />
        <div className="md:col-span-2"><Field label="Judul utama" value={home.title} onChange={(value) => setHomeValue('title', value)} /></div>
        <div className="md:col-span-2"><Field label="Deskripsi" value={home.description} onChange={(value) => setHomeValue('description', value)} multiline /></div>
        <Field label="Label koleksi" value={home.featuredEyebrow} onChange={(value) => setHomeValue('featuredEyebrow', value)} />
        <Field label="Judul koleksi" value={home.featuredTitle} onChange={(value) => setHomeValue('featuredTitle', value)} />
      </div>
      <div className="flex justify-end border-t border-[#eef0f3] bg-[#fbfbfc] px-5 py-4 md:px-7">
        <button onClick={() => save('home', home)} disabled={saving !== null} className="inline-flex items-center gap-2 rounded-lg bg-[#8b6a24] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#74571d] disabled:opacity-50">
          <Save size={14} /> {saving === 'home' ? 'Menyimpan…' : 'Simpan perubahan'}
        </button>
      </div>
    </section>

    <section className={sectionClass}>
      <div className={sectionHeaderClass}>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7f3e9] text-[#8b6a24]"><ImagePlus size={18} /></span>
        <div><h2 className="text-base font-semibold text-[#303746]">Tentang Kami</h2><p className="mt-1 text-xs text-[#8a92a0]">Cerita brand dan gambar halaman tentang.</p></div>
      </div>
      <div className="grid gap-5 p-5 md:p-7">
        <Field label="Label atas" value={about.eyebrow} onChange={(value) => setAboutValue('eyebrow', value)} />
        <Field label="Judul utama" value={about.title} onChange={(value) => setAboutValue('title', value)} />
        <Field label="Isi cerita" value={about.paragraphs} onChange={(value) => setAboutValue('paragraphs', value)} multiline hint="Pisahkan paragraf dengan satu baris kosong." />
        <div className="rounded-lg border border-dashed border-[#d9dde4] bg-[#fbfbfc] p-4">
          <label className="mb-2 block text-xs font-medium text-[#555f70]">Unggah gambar</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadAboutImage(event.target.files?.[0])} disabled={uploading} className="block w-full text-sm text-[#717b8b] file:mr-4 file:rounded-md file:border-0 file:bg-[#f0e9d8] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#74571d] hover:file:bg-[#e9dfc9] disabled:opacity-50" />
          <p className="mt-2 text-xs text-[#8a92a0]">JPG, PNG, WEBP, atau GIF hingga 5 MB. Simpan perubahan setelah unggahan selesai.</p>
        </div>
        <Field label="URL gambar" value={about.imageUrl} onChange={(value) => setAboutValue('imageUrl', value)} hint="Terisi otomatis setelah unggah, atau masukkan URL gambar secara manual." />
      </div>
      <div className="flex justify-end border-t border-[#eef0f3] bg-[#fbfbfc] px-5 py-4 md:px-7">
        <button onClick={() => save('about', about)} disabled={saving !== null || uploading} className="inline-flex items-center gap-2 rounded-lg bg-[#8b6a24] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#74571d] disabled:opacity-50">
          <Save size={14} /> {uploading ? 'Mengunggah…' : saving === 'about' ? 'Menyimpan…' : 'Simpan perubahan'}
        </button>
      </div>
    </section>
  </div>
}
=======
  if (loading) return <p className="py-12 text-sm text-gris-clair">Memuat konten…</p>

  return <div className="max-w-4xl"><h1 className="font-display text-3xl text-blanc">Konten Situs</h1><p className="mb-10 mt-1 text-sm text-gris-clair">Ubah teks dan gambar yang tampil pada Beranda serta Tentang Kami.</p>
    <section className="mb-8 border border-or/10 bg-gris p-6 md:p-8"><h2 className="font-display text-2xl text-blanc">Beranda</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Label atas" value={home.eyebrow} onChange={(value) => setHomeValue('eyebrow', value)} /><Field label="Kata aksen" value={home.accent} onChange={(value) => setHomeValue('accent', value)} /><div className="md:col-span-2"><Field label="Judul utama" value={home.title} onChange={(value) => setHomeValue('title', value)} /></div><div className="md:col-span-2"><Field label="Deskripsi" value={home.description} onChange={(value) => setHomeValue('description', value)} multiline /></div><Field label="Label koleksi" value={home.featuredEyebrow} onChange={(value) => setHomeValue('featuredEyebrow', value)} /><Field label="Judul koleksi" value={home.featuredTitle} onChange={(value) => setHomeValue('featuredTitle', value)} /></div><button onClick={() => save('home', home)} disabled={saving !== null} className="btn-gold mt-7 disabled:opacity-50">{saving === 'home' ? 'Menyimpan…' : 'Simpan Beranda'}</button></section>
    <section className="border border-or/10 bg-gris p-6 md:p-8"><h2 className="font-display text-2xl text-blanc">Tentang Kami</h2><div className="mt-6 grid gap-5"><Field label="Label atas" value={about.eyebrow} onChange={(value) => setAboutValue('eyebrow', value)} /><Field label="Judul utama" value={about.title} onChange={(value) => setAboutValue('title', value)} /><Field label="Isi cerita" value={about.paragraphs} onChange={(value) => setAboutValue('paragraphs', value)} multiline hint="Pisahkan paragraf dengan satu baris kosong." /><div><label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gris-clair">Unggah gambar</label><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => uploadAboutImage(event.target.files?.[0])} disabled={uploading} className="block w-full text-sm text-gris-clair file:mr-4 file:border-0 file:bg-or file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-widest file:text-noir hover:file:bg-or-pale disabled:opacity-50" /><p className="mt-1.5 text-xs text-gris-clair">JPG, PNG, WEBP, atau GIF hingga 5 MB. Setelah unggahan selesai, simpan perubahan di bawah.</p></div><Field label="URL gambar" value={about.imageUrl} onChange={(value) => setAboutValue('imageUrl', value)} hint="Terisi otomatis setelah unggah, atau masukkan URL gambar secara manual." /></div><button onClick={() => save('about', about)} disabled={saving !== null || uploading} className="btn-gold mt-7 disabled:opacity-50">{uploading ? 'Mengunggah…' : saving === 'about' ? 'Menyimpan…' : 'Simpan Tentang Kami'}</button></section>
  </div>
}

>>>>>>> 92f35dd30afc58fd023cebb491f1a4b50765c8e9
