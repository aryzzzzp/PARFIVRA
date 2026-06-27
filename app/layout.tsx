import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import "./globals.css";
// Definisi Font
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'Parfivra — Parfum Mewah',
  description: 'Koleksi parfum eksklusif pilihan maestro parfumeur Prancis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} ${cormorant.variable}`}>
      {/* Tambahkan class 'font-sans' dan 'font-serif' secara default di body 
        agar utility Tailwind langsung mengenali font yang Anda buat.
      */}
      <body className="bg-noir text-creme font-sans antialiased selection:bg-or selection:text-noir">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#2A2A35',
              color: '#F5EDD8',
              border: '1px solid rgba(201,168,76,0.3)',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}