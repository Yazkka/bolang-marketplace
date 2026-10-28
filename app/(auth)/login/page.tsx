import { AuthPanel } from '@/components/auth/auth-panel'
import { AuthForm } from '@/components/auth/auth-form'

export default function Page() {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <AuthPanel title="Energi tepat untuk setiap perjalanan." proof="30.000+ pengendara sudah beralih" />
      <AuthForm mode="login" />
    </div>
  )
}