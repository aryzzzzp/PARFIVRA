export type HomeContent = {
  eyebrow: string
  title: string
  accent: string
  description: string
  featuredEyebrow: string
  featuredTitle: string
}

export type AboutContent = {
  eyebrow: string
  title: string
  paragraphs: string
  imageUrl: string
}

export const defaultHomeContent: HomeContent = {
  eyebrow: 'Koleksi Pilihan ParFivra',
  title: 'Seni dalam Sebotol',
  accent: 'Aroma',
  description: 'Setiap tetes adalah cerita. Temukan racikan parfum pilihan yang menghadirkan kemewahan personal dalam setiap momen.',
  featuredEyebrow: 'Koleksi Pilihan',
  featuredTitle: 'Parfum Terlaris',
}

export const defaultAboutContent: AboutContent = {
  eyebrow: 'Cerita ParFivra',
  title: 'Aroma yang terasa seperti diri sendiri.',
  paragraphs: 'ParFivra hadir sebagai ruang untuk menemukan parfum pilihan yang bukan sekadar wangi, tetapi juga menyimpan kesan dan cerita.\n\nKami memilih setiap koleksi dengan teliti—dari karakter aroma, kualitas racikan, hingga momen yang ingin Anda hadirkan setiap hari.\n\nKami percaya, memilih parfum seharusnya terasa tenang dan personal, seperti menemukan bagian kecil dari diri Anda sendiri.',
  imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=90',
}
