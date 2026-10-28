'use client'
import { useState } from 'react'
import { ShopHeader } from '@/components/shop/shop-header'
import { Hero } from '@/components/shop/hero'
import { ProductCatalog } from '@/components/shop/product-catalog'
import { ShopFooter } from '@/components/shop/shop-footer'
import type { Product } from '@/lib/products'

export function ShopShell({
  products,
  user,
}: {
  products: Product[]
  user: string
}) {
  const [active, setActive] = useState('Semua Produk')

  return (
    <>
      <ShopHeader active={active} onSelect={setActive} user={user} />
      <Hero />
      <main className="mx-auto w-full max-w-6xl px-5">
        <ProductCatalog products={products} active={active} onSelect={setActive} />
      </main>
      <ShopFooter />
    </>
  )
}