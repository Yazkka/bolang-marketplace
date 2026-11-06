import { createClient } from '@/lib/supabase/server'
import { ShopShell } from '@/components/shop/shop-shell'
import type { Product } from '@/lib/products'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('products')
    .select('id, name, category, price, stock, badge')
    .order('created_at')

  // Ambil full_name dari profil atau fallback nama user
  let userName = 'Pengguna'
  if (user?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) userName = profile.full_name
    else userName = user.email.split('@')[0]
  }

  return <ShopShell products={(data ?? []) as Product[]} user={userName} />
}