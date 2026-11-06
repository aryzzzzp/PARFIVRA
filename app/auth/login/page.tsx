'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error('Email atau password salah')
    } else {
      toast.success('Selamat datang kembali!')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl tracking-[0.3em] text-or uppercase">
            ParFivra
          </Link>
          <p className="text-gris-clair text-sm mt-3">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gris p-8 space-y-5">
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
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-clair hover:text-or"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center flex disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="text-center text-xs text-gris-clair pt-2">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-or hover:text-or-pale underline underline-offset-4">
              Daftar sekarang
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-gris-clair mt-6">
          <Link href="/" className="hover:text-or transition-colors">← Kembali ke beranda</Link>
        </p>
      </div>
    </div>
  )
}
