import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'

export const metadata = {
  title: 'Tentang Kami | ParFivra',
  description: 'Mengenal cerita dan filosofi di balik ParFivra.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#17352f]">
      <Navbar variant="light" />

      <section className="mx-auto grid min-h-screen max-w-[1510px] grid-cols-1 items-center gap-10 px-6 pb-10 pt-28 md:grid-cols-[0.95fr_1.25fr] md:gap-20 md:px-12 lg:px-20">
        <div className="relative min-h-[420px] overflow-hidden md:min-h-[710px]">
          <Image
            src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=90"
            alt="Ruang interior hangat yang mencerminkan suasana ParFivra"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 42vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-3xl pb-8 md:pb-0">
          <p className="mb-7 text-xs font-medium uppercase tracking-[0.34em] text-[#b48140]">Sejak awal</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.14] text-[#123c37] md:text-5xl lg:text-6xl">
            Berawal dari keinginan sederhana: menemukan aroma yang terasa seperti diri sendiri.
          </h1>
          <div className="mt-9 max-w-2xl space-y-5 text-base leading-8 text-[#52645e] md:text-lg">
            <p>
              ParFivra hadir sebagai ruang untuk menemukan parfum pilihan yang bukan sekadar wangi, tetapi juga menyimpan kesan dan cerita.
            </p>
            <p>
              Kami memilih setiap koleksi dengan teliti—dari karakter aroma, kualitas racikan, hingga momen yang ingin Anda hadirkan setiap hari.
            </p>
            <p>
              Kami percaya, memilih parfum seharusnya terasa tenang dan personal, seperti menemukan bagian kecil dari diri Anda sendiri.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
