import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { defaultAboutContent, getSiteContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Tentang Kami | ParFivra', description: 'Mengenal cerita dan filosofi di balik ParFivra.' }

export default async function AboutPage() {
  const content = await getSiteContent('about', defaultAboutContent)
  const paragraphs = content.paragraphs.split(/\n\s*\n/).filter(Boolean)
  return <><Navbar /><main className="min-h-screen bg-noir text-creme pt-24"><section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-12 lg:px-16 lg:py-24"><div className="relative min-h-[420px] overflow-hidden border border-or/15 md:min-h-[620px]"><Image src={content.imageUrl} alt="Suasana yang mencerminkan ParFivra" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div><div className="max-w-xl"><p className="section-eyebrow">{content.eyebrow}</p><h1 className="section-title text-5xl md:text-6xl">{content.title}</h1><div className="mt-8 space-y-5 text-base leading-8 text-gris-clair md:text-lg">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></div></section></main><Footer /></>
}
