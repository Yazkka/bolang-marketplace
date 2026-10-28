'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { useCart } from '@/components/shop/cart-provider'
import { UserMenu } from '@/components/shop/user-menu'
import { CATEGORIES } from '@/lib/products'

export function ShopHeader({
  active,
  onSelect,
  user,
  showNav = true, // <-- Tambahkan prop ini dengan default true
}: {
  active?: string
  onSelect?: (c: string) => void
  user: string
  showNav?: boolean
}) {
  const { count, open } = useCart()

  return (
    <header className="sticky top-0 z-40 bg-[#1D2B4D]">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Hanya tampilkan menu kategori jika showNav bernilai true */}
        {showNav && onSelect && (
          <nav className="hidden items-center gap-1 lg:flex">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => onSelect(c)}
                className={`h-9 rounded-lg px-3 text-xs font-medium transition ${
                  active === c ? 'bg-white/15 text-[#FFD11A]' : 'text-white/70 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={open}
            aria-label="Buka keranjang"
            className="relative grid size-10 place-items-center rounded-xl border border-white/15 text-white transition hover:bg-white/10"
          >
            <ShoppingCart className="size-4" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-[#FFD11A] px-1 text-[10px] font-bold text-[#1D2B4D]">
                {count}
              </span>
            )}
          </button>

          <UserMenu name={user} />
        </div>
      </div>
    </header>
  )
}