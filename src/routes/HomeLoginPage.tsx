import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import {
  BookOpen,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  LockKeyhole,
  Mail,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import type { PortalRole } from '@/types/auth'
import { isTokenValid } from '@/lib/tokenUtils'

type LoginMode = 'family' | 'teacher'

export default function HomeLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const existingRole = authService.getRole()
    if (existingRole && isTokenValid(authService.getToken())) {
      void navigate({ to: authService.homeForRole(existingRole) })
    }
  }, [navigate])

  const [mode, setMode] = useState<LoginMode>('family')
  const [role, setRole] = useState<Exclude<PortalRole, 'teacher'>>('student')
  const [studentNumber, setStudentNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeRole: PortalRole = mode === 'teacher' ? 'teacher' : role

  const subtitle = useMemo(() => {
    if (activeRole === 'student') {
      return 'Sign in with your student number and password.'
    }
    if (activeRole === 'parent') {
      return 'Sign in to follow your child’s school records.'
    }
    return 'Access your teaching workspace and schedules.'
  }, [activeRole])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const nextRole = await login({
        role: activeRole,
        password,
        student_number:
          activeRole === 'student'
            ? studentNumber.trim().toUpperCase()
            : undefined,
        email:
          activeRole === 'student' ? undefined : email.trim().toLowerCase(),
      })
      await navigate({ to: authService.homeForRole(nextRole) })
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
      <div className="portal-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.45),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(6,182,212,0.28),transparent_34%),radial-gradient(circle_at_70%_10%,rgba(99,102,241,0.3),transparent_28%)]" />
      <div className="portal-grid pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

      <div className="portal-orb pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="portal-orb-delayed pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="portal-motif pointer-events-none absolute left-[12%] top-[22%] text-white/10">
        <BookOpen className="h-16 w-16" />
      </div>
      <div className="portal-motif pointer-events-none absolute right-[14%] top-[28%] text-white/10 [animation-delay:2s]">
        <UsersRound className="h-14 w-14" />
      </div>
      <div className="portal-motif pointer-events-none absolute bottom-[18%] left-[18%] text-white/10 [animation-delay:4s]">
        <GraduationCap className="h-20 w-20" />
      </div>

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
              {mode === 'teacher' ? (
                <Building2 className="h-6 w-6" />
              ) : (
                <UsersRound className="h-6 w-6" />
              )}
            </span>
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              {mode === 'teacher' ? 'Teacher Portal' : 'Student & Parent Portal'}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Welcome to Chog
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          {mode === 'family' ? (
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  role === 'student'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  role === 'parent'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Parent
              </button>
            </div>
          ) : null}

          <form className="mx-auto mt-6 max-w-sm space-y-4" onSubmit={handleSubmit}>
            {activeRole === 'student' ? (
              <div>
                <label
                  className="mb-2 block text-xs font-semibold text-slate-700"
                  htmlFor="student_number"
                >
                  Student number
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="student_number"
                    required
                    value={studentNumber}
                    onChange={(event) =>
                      setStudentNumber(event.target.value.toUpperCase())
                    }
                    placeholder="e.g. STU-0001"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            ) : (
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
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={
                      activeRole === 'teacher'
                        ? 'teacher@school.edu'
                        : 'parent@email.com'
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                className="mb-2 block text-xs font-semibold text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

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
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-slate-500">
              {mode === 'teacher' ? (
                <>
                  Don&apos;t have a teachers account?{' '}
                  <Link
                    to="/signup/teacher"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Sign up here
                  </Link>
                </>
              ) : role === 'parent' ? (
                <>
                  Don&apos;t have a parent account?{' '}
                  <Link
                    to="/signup/parent"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Sign up here
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have a student account?{' '}
                  <Link
                    to="/signup/student"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Sign up here
                  </Link>
                </>
              )}
            </p>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            {mode === 'family' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('teacher')
                  setError('')
                }}
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Login as a teacher
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('family')
                  setRole('student')
                  setError('')
                }}
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Back to student / parent login
              </button>
            )}
            <p className="mt-3 text-[11px] text-slate-400">
              School administrators can sign in at{' '}
              <Link
                to="/admin/login"
                className="font-semibold text-slate-600 underline-offset-2 hover:underline"
              >
                /admin/login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
