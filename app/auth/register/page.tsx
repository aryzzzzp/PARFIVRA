'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Akun dibuat! Silakan cek email untuk verifikasi.')
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl tracking-[0.3em] text-or uppercase">
            Parfivra
          </Link>
          <p className="text-gris-clair text-sm mt-3">Buat akun baru</p>
        </div>

        <form onSubmit={handleRegister} className="bg-gris p-8 space-y-5">
          <div>
            <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dark"
              placeholder="Nama Anda"
              required
            />
          </div>

          <div>
            <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
              placeholder="nama@email.com"
              required
            />
          </div>

          <div>
            <label className="text-[10px] tracking-widest uppercase text-gris-clair block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark"
              placeholder="Min. 6 karakter"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center flex disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>

          <p className="text-center text-xs text-gris-clair pt-2">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-or hover:text-or-pale underline underline-offset-4">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
