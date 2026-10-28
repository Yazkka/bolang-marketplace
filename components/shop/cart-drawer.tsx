'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, ShoppingCart, Trash2, Minus, Plus, ArrowRight, CheckCircle2,
  BatteryCharging, BatteryFull, PlugZap, Zap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { rupiah } from '@/lib/format'
import { useCart } from '@/components/shop/cart-provider'

function TileIcon({ category }: { category: string }) {
  const cls = 'size-6 text-[#1D2B4D]/70'
  if (category === 'EV Motor') return <BatteryCharging className={cls} />
  if (category === 'EV Car') return <PlugZap className={cls} />
  if (category === 'EV Bicycle' || category === 'AA / AAA') return <BatteryFull className={cls} />
  return <Zap className={cls} />
}

export function CartDrawer() {
  const { lines, count, setQty, remove, isOpen, close, clear } = useCart()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [checkoutResult, setCheckoutResult] = useState<{ orderId: string; total: number } | null>(null)

  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0)

  const checkout = async () => {
    if (lines.length === 0 || processing) return
    setProcessing(true)
    setError('')

    const { data, error: err } = await supabase.rpc('checkout_order', {
      p_items: lines.map((l) => ({ product_id: l.product.id, qty: l.qty })),
    })

    setProcessing(false)
    if (err) {
      setError(err.message)
      return
    }
    setCheckoutResult({ orderId: String(data), total: subtotal })
    clear()
    router.refresh() // stok baru di katalog langsung ikut ter-update
  }

  const goToOrders = () => {
    setCheckoutResult(null)
    close()
    router.push('/akun/pesanan')
  }

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
          <ShoppingCart className="size-5 text-[#1D2B4D]" />
          <h2 className="text-base font-bold text-slate-900">Keranjang Belanja</h2>
          {count > 0 && !checkoutResult && (
            <span className="rounded-full bg-[#FFD11A] px-2 py-0.5 text-[11px] font-bold text-[#1D2B4D]">
              {count} item
            </span>
          )}
          <button
            onClick={close}
            aria-label="Tutup keranjang"
            className="ml-auto grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ===== NOTIFIKASI SUKSES ===== */}
        {checkoutResult ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">Pesanan berhasil dibuat! 🎉</h3>
            <p className="text-sm text-slate-500">
              Kode pesanan <span className="font-bold text-[#1D2B4D]">#{checkoutResult.orderId.slice(0, 8).toUpperCase()}</span>
              {' '}sebesar <span className="font-bold text-slate-900">{rupiah(checkoutResult.total)}</span> telah diproses.
              Stok produk otomatis dikurangi.
            </p>
            <button
              onClick={goToOrders}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-[#1D2B4D] px-6 text-sm font-semibold text-[#FFD11A] transition hover:bg-[#25395F]"
            >
              Lihat Pesanan Saya <ArrowRight className="size-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {lines.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6">
                  <ShoppingCart className="size-10 text-slate-200" />
                  <p className="text-sm text-slate-400">Keranjang masih kosong.</p>
                </div>
              )}

              {lines.map((l) => (
                <div key={l.product.id} className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
                  <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-slate-100">
                    <TileIcon category={l.product.category} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug text-slate-900">{l.product.name}</p>
                    <p className="mt-1 text-[13px] font-semibold text-slate-700">{rupiah(l.product.price)}</p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <button
                        onClick={() => setQty(l.product.id, l.qty - 1)}
                        disabled={l.qty <= 1}
                        aria-label="Kurangi jumlah"
                        className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#1D2B4D] disabled:opacity-30"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-900">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.product.id, l.qty + 1)}
                        disabled={l.qty >= l.product.stock}
                        aria-label="Tambah jumlah"
                        className="grid size-7 place-items-center rounded-lg bg-[#1D2B4D] text-white transition hover:bg-[#25395F] disabled:opacity-30"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(l.product.id)}
                    aria-label={`Hapus ${l.product.name}`}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-5">
              <div className="flex justify-between text-[13px] text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-emerald-600">{rupiah(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-[13px] text-slate-500">
                <span>Pengiriman + Pemasangan</span>
                <span className="font-semibold text-emerald-600">Gratis</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{rupiah(subtotal)}</span>
              </div>

              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

              <button
                onClick={checkout}
                disabled={lines.length === 0 || processing}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FFD11A] text-sm font-bold text-[#1D2B4D] transition hover:bg-[#f5c800] disabled:bg-slate-200 disabled:text-slate-400"
              >
                {processing ? 'Memproses…' : <>Checkout Sekarang <ArrowRight className="size-4" /></>}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                Pembayaran aman · Garansi resmi 24 bulan
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}