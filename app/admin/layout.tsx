import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { ArrowLeft, FileText, LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react'

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

  const links = [
    { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
    { label: 'Produk', href: '/admin/products', icon: Package },
    { label: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Pelanggan', href: '/admin/users', icon: Users },
    { label: 'Konten situs', href: '/admin/content', icon: FileText },
  ]

  return (
    <div className="admin-shell min-h-screen bg-[#f5f6f8] text-[#202534] md:flex">
      <aside className="w-full border-b border-[#e5e7eb] bg-white md:flex md:min-h-screen md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-[#eef0f3] px-5 py-5 md:block md:px-7 md:py-7">
          <Link href="/" className="font-display text-2xl font-semibold tracking-[0.16em] text-[#8b6a24]">
            PARFIVRA
          </Link>
          <span className="rounded-full bg-[#f5f0e5] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b6a24] md:mt-3 md:inline-flex">Office</span>
        </div>
        <div className="hidden px-7 pb-3 pt-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a0ad] md:block">Workspace</div>
        <nav aria-label="Navigasi admin" className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:overflow-visible md:px-4 md:py-0">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-[#687181] transition-colors hover:bg-[#f5f6f8] hover:text-[#8b6a24] md:px-4 md:text-sm"
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-[#eef0f3] p-4 md:block">
          <div className="mb-3 truncate px-3 text-xs text-[#8a92a0]" title={user.email || ''}>{user.email}</div>
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[#687181] transition-colors hover:bg-[#f5f6f8] hover:text-[#8b6a24]">
            <ArrowLeft size={15} />
            Kembali ke situs
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="hidden h-[72px] items-center justify-between border-b border-[#e5e7eb] bg-white px-8 md:flex">
          <div>
            <p className="text-xs text-[#9299a5]">ParFivra / Workspace</p>
            <p className="mt-1 text-sm font-semibold text-[#303746]">Panel administrasi</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#687181]">Sesi admin aktif</span>
            <span className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#f2ead8] text-xs font-semibold text-[#8b6a24]">
              {(user.email?.[0] || 'A').toUpperCase()}
            </span>
          </div>
        </header>
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
