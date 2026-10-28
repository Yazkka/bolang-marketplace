import { Zap } from 'lucide-react'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-[#FFD11A]">
        <Zap className="size-5 fill-[#1D2B4D] text-[#1D2B4D]" />
      </span>
      <div className="leading-tight">
        <p className={dark ? 'font-semibold text-[#1D2B4D]' : 'font-semibold text-white'}>Bolang Energy</p>
        <p className={`text-[10px] tracking-[0.2em] ${dark ? 'text-slate-400' : 'text-white/45'}`}>
          POWER YOUR RIDE
        </p>
      </div>
    </div>
  )
}
