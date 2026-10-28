'use client'
import { useState } from 'react'
import { Package, ShoppingCart } from 'lucide-react'
import { rupiah } from '@/lib/format'
import { CATEGORIES, CATEGORY_MAP, type Product } from '@/lib/products'
import { useCart } from '@/components/shop/cart-provider'
import { BatteryCharging, BatteryFull, PlugZap, Zap } from 'lucide-react'

function CategoryIcon({ category }: { category: string }) {
  if (category === 'EV Motor') return <BatteryCharging className="size-10 text-[#1D2B4D]/70" />
  if (category === 'EV Bicycle') return <BatteryFull className="size-10 text-[#1D2B4D]/70" />
  if (category === 'EV Car') return <PlugZap className="size-10 text-[#1D2B4D]/70" />
  if (category === 'AA / AAA') return <BatteryFull className="size-10 text-[#1D2B4D]/70" />
  return <Zap className="size-10 text-[#1D2B4D]/70" />
}

export function ProductCatalog({
  products,
  active,
  onSelect,
}: {
  products: Product[]
  active: string
  onSelect: (c: string) => void
}) {
  const { add } = useCart()

  const shown =
    active === 'Semua Produk'
      ? products
      : products.filter((p) => p.category === CATEGORY_MAP[active])

  return (
    <section id="katalog" className="py-12">

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Katalog Baterai</h2>
          <p className="mt-1 text-sm text-slate-500">
            {shown.length} produk tersedia · Harga sudah termasuk garansi resmi
          </p>
        </div>
        <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600">
          <option>Urutkan: Terpopuler</option>
          <option>Harga terendah</option>
          <option>Harga tertinggi</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-400">
          Belum ada produk di kategori ini.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => {
            const out = p.stock === 0
            return (
              <article key={p.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
                <div className="relative grid aspect-[4/3] place-items-center rounded-xl bg-gradient-to-br from-[#FFD11A]/15 to-slate-50">
                  <CategoryIcon category={p.category} />
                  <div className="absolute inset-x-2 top-2 flex items-start justify-between">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm">
                      {p.category}
                    </span>
                    {p.badge && (
                      <span className="rounded-full bg-[#FFD11A] px-2 py-0.5 text-[9px] font-bold text-[#1D2B4D]">
                        {p.badge}
                      </span>
                    )}
                  </div>
                </div>

                <p className={`mt-4 text-xs font-medium ${out ? 'text-red-500' : 'text-slate-400'}`}>
                  Stok: {p.stock} unit
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                  {p.name}
                </h3>
                <p className="mt-2 text-lg font-bold text-[#1D2B4D]">
                  {rupiah(p.price)}
                  <span className="ml-1 text-[11px] font-normal text-slate-400">/ unit</span>
                </p>

                <button
                  onClick={() => add(p)}
                  disabled={out}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1D2B4D] text-xs font-semibold text-[#FFD11A] transition hover:bg-[#25395F] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <ShoppingCart className="size-3.5" />
                  {out ? 'Stok Habis' : 'Tambah ke Keranjang'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}