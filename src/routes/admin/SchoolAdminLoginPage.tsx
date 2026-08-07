import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import {
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { schoolAuthService } from '@/services/schoolAuthService'

export default function SchoolAdminLoginPage() {
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
      const auth = await schoolAuthService.login({
        email,
        password,
        is_admin: true,
      })
      if (remember) {
        localStorage.setItem('school_admin_remembered_email', email)
      } else {
        localStorage.removeItem('school_admin_remembered_email')
      }
      await navigate({
        to: auth.role === 'scanner' ? '/admin/gate' : '/admin/dashboard',
      })
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06152f] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.42),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(6,182,212,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.28),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full border border-blue-400/20" />
      <div className="pointer-events-none absolute -left-28 top-[38%] h-72 w-72 rounded-full border border-blue-400/20" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full border border-cyan-300/10" />

      <div className="relative z-10 w-full max-w-[460px]">
        <div className="mb-7 flex items-center justify-center gap-3 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 ring-1 ring-white/30">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-bold leading-none">Chog</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-200">
              School Management Platform
            </p>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/20 bg-white/[0.97] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-2xl sm:p-9">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 ring-1 ring-blue-100">
              <Building2 className="h-6 w-6" />
            </span>
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              School Portal
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage your school workspace
            </p>
          </div>

          <form className="mx-auto mt-8 max-w-sm space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-xs font-semibold text-slate-700"
                htmlFor="email"
              >
                Email address
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
                  placeholder="principal@school.edu"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure access
                </span>
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

            <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
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
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in to school portal'}
            </button>
          </form>

          <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-2 border-t border-slate-100 pt-5 text-center text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            Protected school account access
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-blue-200/70">
          Principal and scanner accounts sign in here.
        </p>
      </div>
    </main>
  )
}
