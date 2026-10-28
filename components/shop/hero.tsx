import Link from 'next/link'
import { ShieldCheck, Wrench, Truck } from 'lucide-react'

const points = [
  { icon: ShieldCheck, label: 'Garansi 24 bulan' },
  { icon: Wrench, label: 'Pemasangan gratis' },
  { icon: Truck, label: 'Kirim se-Indonesia' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1D2B4D]">
      <div className="pointer-events-none absolute -right-32 -top-40 size-[460px] rounded-full bg-white/5" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <span className="inline-flex rounded-full bg-[#FFD11A]/15 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[#FFD11A]">
            GARANSI RESMI 2 TAHUN
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Baterai Kendaraan Listrik Bergaransi &amp; Berdaya Tahan Tinggi
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            Lithium-Ion grade A untuk motor, sepeda, dan mobil listrik. Pengiriman ke seluruh
            Indonesia dengan pemasangan gratis di 40+ kota.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#katalog" className="inline-flex h-11 items-center rounded-xl bg-[#FFD11A] px-6 text-sm font-semibold text-[#1D2B4D]">
              Belanja Sekarang
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {points.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-xs text-white/70">
                <Icon className="size-4 text-[#FFD11A]" /> {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden aspect-[4/3] place-items-center rounded-2xl border border-white/10 bg-white/5 md:grid">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">72V · 30Ah · Li-Ion</p>
            <p className="mt-1 text-xs tracking-widest text-white/40">BOLANG EV PACK</p>
          </div>
        </div>
      </div>
    </section>
  )
}