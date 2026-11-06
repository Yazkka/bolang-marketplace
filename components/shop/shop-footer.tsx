import { Logo } from '@/components/brand/logo'

const cols = [
  { title: 'Produk', links: ['Baterai Motor', 'Baterai Sepeda', 'Baterai Mobil', 'Baterai AA/AAA'] },
  { title: 'Bantuan', links: ['Garansi & Klaim', 'Pemasangan', 'Pengiriman', 'Hubungi Kami'] },
]

export function ShopFooter() {
  return (
    <footer id="garansi" className="mt-16 bg-[#1D2B4D]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/50">
            Distributor resmi baterai kendaraan listrik bersertifikat. Melayani 40+ kota di Indonesia.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-bold text-white">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-white/50 hover:text-[#FFD11A]">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[11px] text-white/35">
        © 2026 Bolang Energy. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  )
}