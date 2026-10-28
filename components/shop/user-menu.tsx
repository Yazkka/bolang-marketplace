'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, PackageCheck, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const initials =
    name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'RA'

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-[#1D2B4D]"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#FFD11A] text-xs font-bold text-[#1D2B4D]">
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-slate-900 sm:inline">{name}</span>
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <Link
              href="/akun/pesanan"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#1D2B4D]"
            >
              <PackageCheck className="size-4 text-slate-500" />
              Pesanan Saya
            </Link>

            <div className="my-1 border-t border-slate-100" />

            <button
              onClick={async () => {
                await supabase.auth.signOut()
                setOpen(false)
                router.refresh()
                router.push('/login')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </div>
        </>
      )}
    </div>
  )
}