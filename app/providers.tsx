'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { CartProvider } from '@/state/CartContext'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: 'border border-white/10 bg-ink/95 text-sand backdrop-blur',
        }}
      />
    </CartProvider>
  )
}
