'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react'
import { useCartStore } from '@/hooks/useCart'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const count = useCartStore((s) => s.count())
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({
        email: data.user.email ?? '',
        role: data.user.user_metadata?.role
      })
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? {
        email: session.user.email ?? '',
        role: session.user.user_metadata?.role
      } : null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-noir/95 backdrop-blur-md border-b border-or/10' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-2xl font-light tracking-[0.3em] text-or uppercase">
          Parfivra
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-10 list-none">
          {[
            { label: 'Koleksi', href: '/shop/catalog' },
            { label: 'Tentang', href: '/#about' },
            { label: 'Kontak', href: '/#contact' },
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-gris-clair text-xs tracking-[0.2em] uppercase hover:text-or transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Hanya tampil kalau admin */}
              {user.role === 'admin' && (
                <Link href="/admin" className="hidden md:block text-xs text-gris-clair hover:text-or transition-colors tracking-widest uppercase">
                  Dashboard
                </Link>
              )}
              <button onClick={logout} className="hidden md:block text-gris-clair hover:text-or transition-colors">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="hidden md:block text-xs text-gris-clair hover:text-or transition-colors tracking-widest uppercase">
              Masuk
            </Link>
          )}

          <Link href="/shop/cart" className="relative text-creme hover:text-or transition-colors">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-or text-noir text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>

          <button className="md:hidden text-creme" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-noir/98 border-t border-or/10 px-6 py-6 flex flex-col gap-6">
          <Link href="/shop/catalog" className="text-sm tracking-widest uppercase text-gris-clair hover:text-or" onClick={() => setOpen(false)}>Koleksi</Link>
          <Link href="/shop/cart" className="text-sm tracking-widest uppercase text-gris-clair hover:text-or" onClick={() => setOpen(false)}>Keranjang ({count})</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm tracking-widest uppercase text-gris-clair hover:text-or" onClick={() => setOpen(false)}>Dashboard</Link>
              )}
              <button onClick={logout} className="text-left text-sm tracking-widest uppercase text-gris-clair hover:text-or">Keluar</button>
            </>
          ) : (
            <Link href="/auth/login" className="text-sm tracking-widest uppercase text-gris-clair hover:text-or" onClick={() => setOpen(false)}>Masuk</Link>
          )}
        </div>
      )}
    </nav>
  )
}