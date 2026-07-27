'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { AboutContent, defaultAboutContent, defaultHomeContent, HomeContent } from '@/lib/site-content-defaults'

type PageKey = 'home' | 'about'

function Field({ label, value, onChange, multiline = false, hint }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string }) {
  return <div><label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gris-clair">{label}</label>{multiline ? <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} className="input-dark resize-y" /> : <input value={value} onChange={(e) => onChange(e.target.value)} className="input-dark" />}{hint && <p className="mt-1.5 text-xs text-gris-clair">{hint}</p>}</div>
}

export default function AdminContentPage() {
  const supabase = useMemo(() => createClient(), [])
  const [home, setHome] = useState<HomeContent>(defaultHomeContent)
  const [about, setAbout] = useState<AboutContent>(defaultAboutContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<PageKey | null>(null)

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
  if (loading) return <p className="py-12 text-sm text-gris-clair">Memuat konten…</p>

  return <div className="max-w-4xl"><h1 className="font-display text-3xl text-blanc">Konten Situs</h1><p className="mb-10 mt-1 text-sm text-gris-clair">Ubah teks dan gambar yang tampil pada Beranda serta Tentang Kami.</p>
    <section className="mb-8 border border-or/10 bg-gris p-6 md:p-8"><h2 className="font-display text-2xl text-blanc">Beranda</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Label atas" value={home.eyebrow} onChange={(value) => setHomeValue('eyebrow', value)} /><Field label="Kata aksen" value={home.accent} onChange={(value) => setHomeValue('accent', value)} /><div className="md:col-span-2"><Field label="Judul utama" value={home.title} onChange={(value) => setHomeValue('title', value)} /></div><div className="md:col-span-2"><Field label="Deskripsi" value={home.description} onChange={(value) => setHomeValue('description', value)} multiline /></div><Field label="Label koleksi" value={home.featuredEyebrow} onChange={(value) => setHomeValue('featuredEyebrow', value)} /><Field label="Judul koleksi" value={home.featuredTitle} onChange={(value) => setHomeValue('featuredTitle', value)} /></div><button onClick={() => save('home', home)} disabled={saving !== null} className="btn-gold mt-7 disabled:opacity-50">{saving === 'home' ? 'Menyimpan…' : 'Simpan Beranda'}</button></section>
    <section className="border border-or/10 bg-gris p-6 md:p-8"><h2 className="font-display text-2xl text-blanc">Tentang Kami</h2><div className="mt-6 grid gap-5"><Field label="Label atas" value={about.eyebrow} onChange={(value) => setAboutValue('eyebrow', value)} /><Field label="Judul utama" value={about.title} onChange={(value) => setAboutValue('title', value)} /><Field label="Isi cerita" value={about.paragraphs} onChange={(value) => setAboutValue('paragraphs', value)} multiline hint="Pisahkan paragraf dengan satu baris kosong." /><Field label="URL gambar" value={about.imageUrl} onChange={(value) => setAboutValue('imageUrl', value)} hint="Gunakan URL gambar dari Unsplash atau Supabase Storage." /></div><button onClick={() => save('about', about)} disabled={saving !== null} className="btn-gold mt-7 disabled:opacity-50">{saving === 'about' ? 'Menyimpan…' : 'Simpan Tentang Kami'}</button></section>
  </div>
}

