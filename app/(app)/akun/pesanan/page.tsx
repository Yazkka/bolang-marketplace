import { createClient } from '@/lib/supabase/server'
import { OrdersView } from '@/components/shop/orders-view'

export type OrderItem = {
  id: string
  product_name: string
  price: number
  qty: number
  products: { category: string } | null
}
export type Order = {
  id: string
  total: number
  status: string
  created_at: string
  order_items: OrderItem[]
}

export default async function PesananPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { data } = await supabase
    .from('orders')
    .select(
      'id, total, status, created_at, order_items(id, product_name, price, qty, products(category))'
    )
    .order('created_at', { ascending: false })

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Pengguna'

  return (
    <OrdersView
      userName={name}
      userEmail={user?.email ?? ''}
      orders={(data ?? []) as unknown as Order[]}
    />
  )
}