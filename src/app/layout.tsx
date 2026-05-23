import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import SlidingCart from '@/components/SlidingCart'
import CustomCursor from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'Parvé — Ultra-Premium Dresses',
  description: 'Ultra-premium dresses for the modern American woman. Where luxury meets effortless confidence.',
  keywords: ['luxury dresses', 'premium fashion', 'women dresses', 'Parvé'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />
        <Navbar />
        <SlidingCart />
        {children}
      </body>
    </html>
  )
}
