export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  badge: string | null
}

export const CATEGORIES = [
  'Semua Produk',
  'Baterai AA-AAA',
  'Sepeda Listrik',
  'Motor Listrik',
  'Mobil Listrik',
] as const

// label tombol filter -> nilai di kolom category
export const CATEGORY_MAP: Record<string, string> = {
  'Baterai AA-AAA': 'AA / AAA',
  'Sepeda Listrik': 'EV Bicycle',
  'Motor Listrik': 'EV Motor',
  'Mobil Listrik': 'EV Car',
}