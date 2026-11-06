'use client'
import { createContext, useContext, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'

type Line = { product: Product; qty: number }
type Ctx = {
  lines: Line[]
  count: number
  add: (p: Product) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  isOpen: boolean
  open: () => void
  close: () => void
  clear: () => void
}

const CartContext = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo<Ctx>(() => ({
    lines,
    clear: () => setLines([]),
    count: lines.length, // badge = jumlah produk, bukan total qty
    add: (p) =>
      setLines((prev) => {
        const found = prev.find((l) => l.product.id === p.id)
        if (!found) return [...prev, { product: p, qty: 1 }]
        return prev.map((l) =>
          l.product.id === p.id ? { ...l, qty: Math.min(l.qty + 1, p.stock) } : l
        )
      }),
    setQty: (id, qty) =>
      setLines((prev) =>
        prev.map((l) =>
          l.product.id === id
            ? { ...l, qty: Math.max(1, Math.min(qty, l.product.stock)) }
            : l
        )
      ),
    remove: (id) => setLines((prev) => prev.filter((l) => l.product.id !== id)),
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }), [lines, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider')
  return ctx
}