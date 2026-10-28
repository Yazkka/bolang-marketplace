'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string }

export async function authenticate(
  mode: 'login' | 'register',
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim()

  if (!email || !password) return { error: 'Email dan password wajib diisi.' }
  if (mode === 'register' && !fullName) return { error: 'Nama lengkap wajib diisi.' }
  if (mode === 'register' && password.length < 8) return { error: 'Password minimal 8 karakter.' }

  const { error } =
    mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })

  if (error) return { error: error.message }
  redirect('/')
}