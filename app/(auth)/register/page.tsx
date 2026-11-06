import { AuthPanel } from '@/components/auth/auth-panel'
import { AuthForm } from '@/components/auth/auth-form'

export default function Page() {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <AuthPanel title="Daftar gratis, langsung dapat 500 poin." proof="12.000+ pelanggan baru bulan ini" />
      <AuthForm mode="register" />
    </div>
  )
}