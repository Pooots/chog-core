import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import {
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  Eye,
  EyeOff,
  FlaskConical,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { adminAuthService } from '@/services/adminAuthService'

export default function SuperAdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await adminAuthService.login({ email, password, is_admin: true })
      if (remember) {
        localStorage.setItem('admin_remembered_email', email)
      } else {
        localStorage.removeItem('admin_remembered_email')
      }
      await navigate({ to: '/admin/super/dashboard' })
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : null
      setError(message ?? 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-800 px-12 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <BookOpen className="absolute left-16 top-20 h-20 w-20 -rotate-12" />
          <Trophy className="absolute right-20 top-36 h-16 w-16" />
          <Calculator className="absolute bottom-28 left-20 h-20 w-20 rotate-6" />
          <FlaskConical className="absolute bottom-32 right-24 h-20 w-20 -rotate-12" />
          <BarChart3 className="absolute left-[44%] top-[46%] h-16 w-16 rotate-6" />
        </div>

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-bold leading-none">Chog</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-100">
              School Management Platform
            </p>
          </div>
        </div>

        <div className="relative my-auto max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
            Super Admin Portal
          </p>
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            One platform for your entire school community.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-blue-100">
            Manage your school ecosystem with secure access, centralized
            controls, and the tools your community needs.
          </p>
        </div>

        <ul className="relative space-y-3 text-sm text-blue-50">
          {[
            'Centralized school administration',
            'Role-based access and security',
            'Students, parents, and teachers in one place',
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-cyan-300" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-bold leading-none">Chog</p>
              <p className="mt-1 text-[9px] uppercase tracking-widest text-slate-500">
                School Management Platform
              </p>
            </div>
          </div>

          <div className="mb-8">
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to your super admin dashboard
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@chog.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <span className="text-xs text-blue-600">Super admin access</span>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              Remember me
            </label>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Protected super administrator access
          </p>
        </div>
      </section>
    </main>
  )
}
