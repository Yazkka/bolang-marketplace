'use client'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Info, Lock, Mail, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authenticate, type AuthState } from '@/app/(auth)/actions'

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-xl bg-[#1D2B4D] text-sm font-semibold text-[#FFD11A] hover:bg-[#25395f]"
    >
      {pending ? 'Memproses…' : label}
      {!pending && <ArrowRight className="ml-2 size-4" />}
    </Button>
  )
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const action = authenticate.bind(null, mode)
  const [state, formAction] = useActionState<AuthState, FormData>(action, {})
  const isLogin = mode === 'login'

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12 md:py-20">
      <div className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(16,24,40,.06)] sm:p-9">
        <h2 className="text-2xl font-bold text-slate-900">{isLogin ? 'Masuk ke akunmu' : 'Buat akun Bolang'}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {isLogin ? 'Versi demo — masuk pakai email dan password apa saja.' : 'Cukup nama, email, dan password. Isi bebas untuk demo.'}
        </p>

        <form action={formAction} className="mt-7 space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="fullName" name="fullName" placeholder="Rizky Pratama" autoComplete="name" className="h-11 pl-9" required />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input id="email" name="email" type="email" placeholder="nama@email.com" autoComplete="email" className="h-11 pl-9" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete={isLogin ? 'current-password' : 'new-password'} className="h-11 pl-9" required />
            </div>
            {!isLogin && <p className="text-xs text-slate-400">Minimal 8 karakter, kombinasi huruf dan angka</p>}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            <Info className="mt-px size-3.5 shrink-0" />
            {isLogin ? 'Contoh: demo@bolang.id · password: bolang123' : 'Data tidak diverifikasi — akun langsung aktif.'}
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <Submit label={isLogin ? 'Masuk' : 'Buat Akun'} />
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <Link href={isLogin ? '/register' : '/login'} className="font-semibold text-slate-900 hover:underline">
            {isLogin ? 'Daftar gratis' : 'Masuk di sini'}
          </Link>
        </p>
      </div>
    </div>
  )
}