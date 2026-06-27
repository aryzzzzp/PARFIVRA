import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-noir flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gris border-r border-or/10 flex flex-col">
        <div className="p-6 border-b border-or/10">
          <Link href="/" className="font-display text-xl tracking-[0.3em] text-or uppercase">
            ParFivra
          </Link>
          <p className="text-[10px] text-gris-clair mt-1 tracking-widest uppercase">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Produk', href: '/admin/products' },
            { label: 'Pesanan', href: '/admin/orders' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-4 py-2.5 text-xs tracking-widest uppercase text-gris-clair hover:text-or hover:bg-or/5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-or/10">
          <p className="text-[10px] text-gris-clair truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
