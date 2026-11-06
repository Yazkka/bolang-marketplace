import { createClient } from '@/lib/supabase/server'
import { TicketCard } from '@/components/dashboard/ticket-card'

export default async function FrontlineAIPage() {
  const supabase = await createClient()
  const { data: tickets } = await supabase
    .from('cs_tickets')
    .select('id, customer_name, message, category, status, is_read, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-lg font-bold text-slate-900">Frontline AI — Customer Service Triage</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola tiket komplain dan pertanyaan pelanggan secara real-time
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Filter Kategori */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {['Semua Tiket', 'Komplain', 'Pertanyaan', 'Pemesanan', 'Garansi'].map((cat) => {
              // TODO: implement filter state jika perlu
              return (
                <button
                  key={cat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:border-[#1D2B4D] hover:text-[#1D2B4D]"
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Daftar Kartu Tiket */}
        <div className="space-y-3">
          {(tickets ?? []).map((ticket: any) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </main>
    </div>
  )
}