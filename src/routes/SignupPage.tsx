import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import {
  BookOpen,
  BadgeCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  IdCard,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import type { PortalRole } from '@/types/auth'
import { isTokenValid } from '@/lib/tokenUtils'

const inputClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'

const roleCopy: Record<
  PortalRole,
  { label: string; title: string; subtitle: string }
> = {
  student: {
    label: 'Student signup',
    title: 'Sign up as a student',
    subtitle: 'Use your student number and LRN, then create a password.',
  },
  parent: {
    label: 'Parent signup',
    title: 'Sign up as a parent',
    subtitle:
      'Create your parent account. You can link students from your dashboard.',
  },
  teacher: {
    label: 'Teacher signup',
    title: 'Sign up as a teacher',
    subtitle: 'Use your employee ID and PRC license, then create a password.',
  },
}

export default function SignupPage({ role }: { role: PortalRole }) {
  const navigate = useNavigate()
  const { register } = useAuth()
  const copy = roleCopy[role]

  useEffect(() => {
    const existingRole = authService.getRole()
    if (existingRole && isTokenValid(authService.getToken())) {
      void navigate({ to: authService.homeForRole(existingRole) })
    }
  }, [navigate])

  const [studentNumber, setStudentNumber] = useState('')
  const [lrnNumber, setLrnNumber] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [prcLicense, setPrcLicense] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const otherSignupLinks = useMemo(() => {
    if (role === 'student') {
      return (
        <>
          Parent?{' '}
          <Link
            to="/signup/parent"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign up here
          </Link>
          {' · '}
          Teacher?{' '}
          <Link
            to="/signup/teacher"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign up here
          </Link>
        </>
      )
    }
    if (role === 'parent') {
      return (
        <>
          Student?{' '}
          <Link
            to="/signup/student"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign up here
          </Link>
          {' · '}
          Teacher?{' '}
          <Link
            to="/signup/teacher"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign up here
          </Link>
        </>
      )
    }
    return (
      <>
        Student?{' '}
        <Link
          to="/signup/student"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Sign up here
        </Link>
        {' · '}
        Parent?{' '}
        <Link
          to="/signup/parent"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Sign up here
        </Link>
      </>
    )
  }, [role])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const nextRole = await register({
        role,
        password,
        password_confirmation: passwordConfirmation,
        student_number:
          role === 'student'
            ? studentNumber.trim().toUpperCase()
            : undefined,
        lrn_number: role === 'student' ? lrnNumber.trim() : undefined,
        employee_id:
          role === 'teacher' ? employeeId.trim().toUpperCase() : undefined,
        prc_license: role === 'teacher' ? prcLicense.trim() : undefined,
        email: role === 'parent' ? email.trim().toLowerCase() : undefined,
        first_name: role === 'parent' ? firstName.trim() : undefined,
        last_name: role === 'parent' ? lastName.trim() : undefined,
      })
      await navigate({ to: authService.homeForRole(nextRole) })
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const data = requestError.response?.data as
          | { message?: string; errors?: Record<string, string[]> }
          | undefined
        const firstFieldError = data?.errors
          ? Object.values(data.errors).flat()[0]
          : undefined
        setError(firstFieldError ?? data?.message ?? 'Unable to sign up.')
      } else {
        setError('Unable to sign up. Please try again.')
      }
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

      <div className="relative z-10 w-full max-w-[480px]">
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
              <UserRound className="h-6 w-6" />
            </span>
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.label}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{copy.subtitle}</p>
          </div>

          <form className="mx-auto mt-6 max-w-sm space-y-4" onSubmit={handleSubmit}>
            {role === 'student' ? (
              <>
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
                      className={`${inputClass} uppercase placeholder:normal-case`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="mb-2 block text-xs font-semibold text-slate-700"
                    htmlFor="lrn_number"
                  >
                    LRN number
                  </label>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="lrn_number"
                      required
                      value={lrnNumber}
                      onChange={(event) => setLrnNumber(event.target.value)}
                      placeholder="e.g. 123456789012"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {role === 'teacher' ? (
              <>
                <div>
                  <label
                    className="mb-2 block text-xs font-semibold text-slate-700"
                    htmlFor="employee_id"
                  >
                    Employee ID
                  </label>
                  <div className="relative">
                    <BadgeCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="employee_id"
                      required
                      value={employeeId}
                      onChange={(event) =>
                        setEmployeeId(event.target.value.toUpperCase())
                      }
                      placeholder="e.g. TCH-0001"
                      className={`${inputClass} uppercase placeholder:normal-case`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="mb-2 block text-xs font-semibold text-slate-700"
                    htmlFor="prc_license"
                  >
                    PRC license
                  </label>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="prc_license"
                      required
                      value={prcLicense}
                      onChange={(event) => setPrcLicense(event.target.value)}
                      placeholder="e.g. PRC-123456"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {role === 'parent' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="mb-2 block text-xs font-semibold text-slate-700"
                      htmlFor="first_name"
                    >
                      First name
                    </label>
                    <input
                      id="first_name"
                      required
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="First name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-xs font-semibold text-slate-700"
                      htmlFor="last_name"
                    >
                      Last name
                    </label>
                    <input
                      id="last_name"
                      required
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Last name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
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
                      placeholder="parent@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            ) : null}

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
                  placeholder="Create a password"
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

            <div>
              <label
                className="mb-2 block text-xs font-semibold text-slate-700"
                htmlFor="password_confirmation"
              >
                Confirm password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  placeholder="Confirm your password"
                  className={inputClass}
                />
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
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
            <p className="text-center text-xs text-slate-400">
              {otherSignupLinks}
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}
