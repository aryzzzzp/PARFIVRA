'use client'

import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react'
import { useCartStore } from '@/hooks/useCart'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const count = useCartStore((s) => s.count())
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  useEffect(() => {
    const setUserWithProfile = async (authUser: { id: string; email?: string } | null) => {
      if (!authUser) {
        setUser(null)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      setUser({
        email: authUser.email ?? '',
        role: profile?.role,
      })
    }

    supabase.auth.getUser().then(({ data }) => setUserWithProfile(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserWithProfile(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    setHasMounted(true)
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

  const isLight = variant === 'light'
  const navBackground = isLight
    ? 'bg-[#f8f5ef]/95 backdrop-blur-md border-b border-[#17352f]/10'
    : scrolled ? 'bg-noir/95 backdrop-blur-md border-b border-or/10' : 'bg-transparent'
  const mainText = isLight ? 'text-[#17352f]' : 'text-creme'
  const mutedText = isLight ? 'text-[#365249]' : 'text-gris-clair'
  const hoverText = isLight ? 'hover:text-[#a87532]' : 'hover:text-or'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`font-display text-2xl font-light tracking-[0.3em] uppercase ${isLight ? 'text-[#17352f]' : 'text-or'}`}>
          Parfivra
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-10 list-none">
          {[
            { label: 'Beranda', href: '/' },
            { label: 'Katalog', href: '/shop/catalog' },
            { label: 'Tentang Kami', href: '/about' },
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={`${mutedText} ${hoverText} text-xs tracking-[0.2em] uppercase transition-colors`}>
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
                <Link href="/admin" className={`hidden md:block text-xs ${mutedText} ${hoverText} transition-colors tracking-widest uppercase`}>
                  Dashboard
                </Link>
              )}
              <button onClick={logout} className={`hidden md:block ${mutedText} ${hoverText} transition-colors`}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link href="/auth/login" className={`hidden md:block text-xs ${mutedText} ${hoverText} transition-colors tracking-widest uppercase`}>
              Masuk
            </Link>
          )}

          <Link href="/shop/cart" className={`relative ${mainText} ${hoverText} transition-colors`}>
            <ShoppingBag size={20} />
            {hasMounted && count > 0 && (
              <span className="absolute -top-2 -right-2 bg-or text-noir text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>

          <button className={`md:hidden ${mainText}`} onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={`md:hidden ${isLight ? 'bg-[#f8f5ef] border-[#17352f]/10' : 'bg-noir/98 border-or/10'} border-t px-6 py-6 flex flex-col gap-6`}>
          <Link href="/" className={`text-sm tracking-widest uppercase ${mutedText} ${hoverText}`} onClick={() => setOpen(false)}>Beranda</Link>
          <Link href="/shop/catalog" className={`text-sm tracking-widest uppercase ${mutedText} ${hoverText}`} onClick={() => setOpen(false)}>Katalog</Link>
          <Link href="/about" className={`text-sm tracking-widest uppercase ${mutedText} ${hoverText}`} onClick={() => setOpen(false)}>Tentang Kami</Link>
          <Link href="/shop/cart" className={`text-sm tracking-widest uppercase ${mutedText} ${hoverText}`} onClick={() => setOpen(false)}>Keranjang ({count})</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className={`text-sm tracking-widest uppercase ${mutedText} ${hoverText}`} onClick={() => setOpen(false)}>Dashboard</Link>
              )}
              <button onClick={logout} className={`text-left text-sm tracking-widest uppercase ${mutedText} ${hoverText}`}>Keluar</button>
            </>
          ) : (
            <Link href="/auth/login" className={`text-sm tracking-widest uppercase ${mutedText} ${hoverText}`} onClick={() => setOpen(false)}>Masuk</Link>
          )}
        </div>
      )}
    </nav>
  )
}
