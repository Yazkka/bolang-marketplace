'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ChevronRight, Package, LogOut, RotateCw, ArrowUpDown, Search,
  BatteryCharging, BatteryFull, PlugZap, Zap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { rupiah } from '@/lib/format'
import { ShopHeader } from '@/components/shop/shop-header'
import { ShopFooter } from '@/components/shop/shop-footer'
import type { Order } from '@/app/(app)/akun/pesanan/page'

const CATEGORY_LABEL: Record<string, string> = {
  'EV Motor': 'Motor Listrik',
  'EV Bicycle': 'Sepeda Listrik',
  'EV Car': 'Mobil Listrik',
  'AA / AAA': 'Baterai AA/AAA',
  'Lithium-Ion': 'Lithium-Ion',
}

function CategoryIcon({ category }: { category: string }) {
  const cls = 'size-6 text-[#1D2B4D]/70'
  if (category === 'EV Motor') return <BatteryCharging className={cls} />
  if (category === 'EV Car') return <PlugZap className={cls} />
  if (category === 'EV Bicycle' || category === 'AA / AAA') return <BatteryFull className={cls} />
  if (category === 'Lithium-Ion') return <Zap className={cls} />
  return <Package className={cls} />
}

const orderCode = (o: Order) => {
  const d = new Date(o.created_at)
  return `BL-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${o.id.slice(0, 3).toUpperCase()}`
}

export function OrdersView({
  userName,
  userEmail,
  orders,
}: {
  userName: string
  userEmail: string
  orders: Order[]
}) {
  const router = useRouter()
  const [sort, setSort] = useState<'semua' | 'terbaru'>('semua')
  const [visible, setVisible] = useState(5)

  const initials = userName.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'RS'

  const sorted =
    sort === 'terbaru'
      ? [...orders].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      : orders

  const logout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <>
      <ShopHeader user={userName} showNav={false} />

      <main className="min-h-dvh bg-[#F8FAFC]">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-[#1D2B4D]">Beranda</Link>
            <ChevronRight className="size-3" />
            <span>Akun</span>
            <ChevronRight className="size-3" />
            <span className="font-semibold text-slate-700">Pesanan Saya</span>
          </nav>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">Pesanan Saya</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pesanan dan unduh invoice dalam satu tempat.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
            {/* Kartu profil */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FDF3C7] text-sm font-bold text-[#1D2B4D]">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                  <p className="truncate text-xs text-slate-500">{userEmail}</p>
                </div>
              </div>

              <div className="my-3 border-t border-slate-100" />

              <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-semibold text-[#1D2B4D]">
                <Package className="size-4" />
                Pesanan Saya
              </div>

              <div className="my-3 border-t border-slate-100" />

              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Keluar
              </button>
            </aside>

            {/* Daftar pesanan */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSort('semua')}
                    className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-semibold transition ${
                      sort === 'semua'
                        ? 'bg-[#1D2B4D] text-white'
                        : 'border border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Semua
                    <span className={`rounded-full px-1.5 text-[10px] ${sort === 'semua' ? 'bg-white/20' : 'bg-slate-100'}`}>
                      {orders.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setSort('terbaru')}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
                      sort === 'terbaru' ? 'text-[#1D2B4D]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Terbaru <ArrowUpDown className="size-3.5" />
                  </button>
                </div>
              </div>

              {sorted.length === 0 ? (
                <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-16">
                  <Search className="size-10 text-slate-300" />
                  <p className="text-sm text-slate-400">Belum ada pesanan.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {sorted.slice(0, visible).map((o) => (
                    <article key={o.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="border-b border-slate-100 px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">#{orderCode(o)}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {new Date(o.created_at).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <ul className="divide-y divide-slate-100">
                        {o.order_items.map((it) => (
                          <li key={it.id} className="flex items-center gap-3 px-5 py-4">
                            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-100">
                              <CategoryIcon category={it.products?.category ?? ''} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">{it.product_name}</p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {CATEGORY_LABEL[it.products?.category ?? ''] ?? 'Baterai'}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs text-slate-500">x{it.qty}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
                        <span className="text-xs text-slate-500">Total Pembayaran</span>
                        <span className="text-sm font-bold text-slate-900">{rupiah(o.total)}</span>
                      </div>
                    </article>
                  ))}

                  {visible < sorted.length && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setVisible((v) => v + 5)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:border-[#1D2B4D]"
                      >
                        <RotateCw className="size-3.5" /> Muat Lebih Banyak
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <ShopFooter />
    </>
  )
}