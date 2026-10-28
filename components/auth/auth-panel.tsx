import { Check } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

const perks = ['Garansi resmi 24 bulan', 'Pemasangan gratis di seluruh Indonesia', 'Konsultasi teknis 7 hari seminggu']
const avatars = [
  { t: 'R', c: 'bg-[#FFD11A] text-[#1D2B4D]' },
  { t: 'S', c: 'bg-[#2563EB] text-white' },
  { t: 'D', c: 'bg-[#10B981] text-white' },
  { t: '+', c: 'bg-white text-[#1D2B4D]' },
]

export function AuthPanel({ title, proof }: { title: string; proof: string }) {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1D2B4D] p-10 md:flex">
      <div className="pointer-events-none absolute -top-40 -right-28 size-[420px] rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-44 -left-24 size-[380px] rounded-full bg-white/[0.03]" />

      <Logo />

      <div className="relative max-w-md">
        <h1 className="text-4xl font-bold leading-tight text-white">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          Baterai lithium berkualitas untuk motor, sepeda, dan mobil listrik. Garansi resmi 24 bulan dengan pemasangan gratis.
        </p>
        <ul className="mt-8 space-y-3">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-3 text-sm text-white/75">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#FFD11A]">
                <Check className="size-3 text-[#1D2B4D]" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex -space-x-2">
          {avatars.map((a) => (
            <span key={a.t} className={`grid size-7 place-items-center rounded-full border-2 border-[#1D2B4D] text-[10px] font-semibold ${a.c}`}>
              {a.t}
            </span>
          ))}
        </div>
        <p className="text-xs text-white/50">{proof}</p>
      </div>
    </aside>
  )
}