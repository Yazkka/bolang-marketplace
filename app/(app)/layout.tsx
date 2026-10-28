import { CartProvider } from '@/components/shop/cart-provider'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { ChatWidget } from '@/components/shop/chat-widget'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <ChatWidget />
    </CartProvider>
  )
}