import { useEffect, useMemo, useState, type FormEvent } from 'react'
import axios from 'axios'
import {
  BookOpen,
  GraduationCap,
  Hash,
  IdCard,
  LogOut,
  Plus,
  School,
  UsersRound,
  X,
} from 'lucide-react'
import { StudentNumberQr } from '@/components/admin/StudentNumberQr'
import ParentLinkedStudentDetail, {
  LinkedStudentCard,
} from '@/components/portal/ParentLinkedStudentDetail'
import PortalNotificationBell from '@/components/portal/PortalNotificationBell'
import StudentAcademicTabs, {
  type StudentAcademicTab,
} from '@/components/portal/StudentAcademicTabs'
import TeacherAcademicPanel from '@/components/portal/TeacherAcademicPanel'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import type {
  PortalParentProfile,
  PortalParentStudent,
  PortalRole,
  PortalSchool,
  PortalStudentProfile,
} from '@/types/auth'
import type { PortalNotificationItem } from '@/types/portalNotification'

function notificationTargetTab(
  type: string,
): StudentAcademicTab | null {
  if (type === 'attendance') return 'attendance'
  if (type === 'grade_posted') return 'grades'
  if (type === 'school_entrance') return 'entrance'
  return null
}

function notificationQuarter(data?: Record<string, unknown> | null) {
  const raw = data?.quarter ?? data?.term
  const value = typeof raw === 'number' ? raw : Number(raw)
  if (Number.isFinite(value) && value >= 1 && value <= 3) return value
  return undefined
}

const copy: Record<
  PortalRole,
  { title: string; description: string; icon: typeof GraduationCap }
> = {
  student: {
    title: 'Student Portal',
    description: 'Your room, schedule, attendance, entrance, grades, and teacher tasks.',
    icon: GraduationCap,
  },
  parent: {
    title: 'Parent Portal',
    description:
      'Open a linked student to view their profile, room, schedule, attendance, grades, and tasks.',
    icon: UsersRound,
  },
  teacher: {
    title: 'Teacher Portal',
    description:
      'View your information, students, schedule, grades, and tasks.',
    icon: BookOpen,
  },
}

export default function PortalHomePage({ role }: { role: PortalRole }) {
  const { user, logout, setUser } = useAuth()
  const content = copy[role]
  const Icon = content.icon

  const [school, setSchool] = useState<PortalSchool | null>(() =>
    authService.getSchool(),
  )
  const [parentProfile, setParentProfile] = useState<PortalParentProfile | null>(
    () =>
      role === 'parent'
        ? authService.getProfile<PortalParentProfile>()
        : null,
  )
  const [studentProfile, setStudentProfile] =
    useState<PortalStudentProfile | null>(() =>
      role === 'student'
        ? authService.getProfile<PortalStudentProfile>()
        : null,
    )
  const [studentNumber, setStudentNumber] = useState('')
  const [lrnNumber, setLrnNumber] = useState('')
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] =
    useState<PortalParentStudent | null>(null)
  const [academicFocus, setAcademicFocus] = useState<{
    tab: StudentAcademicTab
    quarter?: number
    key: string
  } | null>(null)

  useEffect(() => {
    if (role !== 'student' && role !== 'parent' && role !== 'teacher') return

    let cancelled = false

    void authService
      .me()
      .then((data) => {
        if (cancelled) return
        setUser(data.user)
        setSchool(data.school)
        if (role === 'student') {
          setStudentProfile(data.profile as PortalStudentProfile)
        }
        if (role === 'parent') {
          setParentProfile(data.profile as PortalParentProfile)
        }
      })
      .catch(() => {
        // Keep cached localStorage profile if refresh fails.
      })

    return () => {
      cancelled = true
    }
  }, [role, setUser])

  useEffect(() => {
    if (!qrModalOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setQrModalOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [qrModalOpen])

  const linkedStudents = useMemo(
    () => parentProfile?.students ?? [],
    [parentProfile],
  )

  useEffect(() => {
    setSelectedStudent((current) => {
      if (!current) return null
      return linkedStudents.find((student) => student.uuid === current.uuid) ?? null
    })
  }, [linkedStudents])

  const scrollToAcademics = (anchorId: string, delay = 80) => {
    window.setTimeout(() => {
      document
        .getElementById(anchorId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, delay)
  }

  const handleOpenNotification = (item: PortalNotificationItem) => {
    const tab = notificationTargetTab(item.type)
    if (!tab) return

    const quarter =
      tab === 'grades' ? notificationQuarter(item.data) : undefined
    setAcademicFocus({
      tab,
      quarter,
      key: item.uuid,
    })

    if (role === 'student') {
      scrollToAcademics('student-academics')
      return
    }

    if (role === 'parent') {
      const studentUuid = item.student_uuid ?? item.student?.uuid
      const matched = linkedStudents.find(
        (student) => student.uuid === studentUuid,
      )
      if (matched) {
        setSelectedStudent(matched)
        scrollToAcademics('parent-student-academics', 160)
      }
    }
  }

  const qrValue =
    studentProfile?.student_number ?? user?.login_identifier ?? ''

  const handleLinkStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLinkError('')
    setLinkSuccess('')
    setIsLinking(true)

    try {
      const response = await authService.linkStudent({
        student_number: studentNumber.trim().toUpperCase(),
        lrn_number: lrnNumber.trim(),
      })
      setUser(response.user)
      setSchool(response.school)
      setParentProfile(response.profile)
      setStudentNumber('')
      setLrnNumber('')
      setLinkSuccess('Student linked successfully.')
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const data = requestError.response?.data as
          | { message?: string; errors?: Record<string, string[]> }
          | undefined
        const firstFieldError = data?.errors
          ? Object.values(data.errors).flat()[0]
          : undefined
        setLinkError(
          firstFieldError ?? data?.message ?? 'Unable to link student.',
        )
      } else {
        setLinkError('Unable to link student. Please try again.')
      }
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-600/20">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Chog</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {content.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PortalNotificationBell onOpenNotification={handleOpenNotification} />
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Welcome, {user?.full_name ?? 'User'}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {content.description}
                </p>
                {role === 'student' && school ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    <School className="h-3.5 w-3.5" />
                    {school.name} ({school.code})
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex w-full items-start justify-center gap-3 sm:w-auto sm:justify-start sm:self-auto">
              {school && role !== 'student' ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  <School className="h-3.5 w-3.5" />
                  {school.name} ({school.code})
                </div>
              ) : role === 'parent' ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  <School className="h-3.5 w-3.5" />
                  Link a student to connect a school
                </div>
              ) : null}
              {role === 'student' && qrValue ? (
                <div className="shrink-0 text-center">
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="rounded-2xl outline-none transition hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-blue-500/30"
                    aria-label="Open student QR code"
                  >
                    <StudentNumberQr
                      studentNumber={qrValue}
                      size={140}
                      className="!rounded-2xl sm:hidden"
                    />
                    <StudentNumberQr
                      studentNumber={qrValue}
                      size={72}
                      className="!hidden !gap-1 !rounded-xl !p-2 sm:!inline-flex"
                    />
                  </button>
                  {studentProfile?.lrn_number ? (
                    <p className="mt-1 text-[10px] text-slate-400">
                      LRN {studentProfile.lrn_number}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Role
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                {role}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">
                {user?.email ?? '—'}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {role === 'student' ? 'Level' : 'Login ID'}
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">
                {role === 'student'
                  ? (studentProfile?.level?.name ??
                    studentProfile?.room?.level?.name ??
                    'Not assigned')
                  : (user?.login_identifier ?? 'Email account')}
              </p>
            </article>
          </div>

          {role === 'student' ? (
            <StudentAcademicTabs
              initialTab={academicFocus?.tab}
              initialQuarter={academicFocus?.quarter}
              focusKey={academicFocus?.key}
            />
          ) : null}

          {role === 'teacher' ? <TeacherAcademicPanel /> : null}

          {role === 'parent' ? (
            selectedStudent ? (
              <ParentLinkedStudentDetail
                student={selectedStudent}
                onBack={() => {
                  setSelectedStudent(null)
                  setAcademicFocus(null)
                }}
                initialTab={academicFocus?.tab}
                initialQuarter={academicFocus?.quarter}
                focusKey={academicFocus?.key}
              />
            ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Linked students
                  </h2>
                </div>
                {linkedStudents.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No students linked yet. Add one with student number and LRN.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {linkedStudents.map((student) => (
                      <LinkedStudentCard
                        key={student.uuid}
                        student={student}
                        onSelect={() => {
                          setAcademicFocus(null)
                          setSelectedStudent(student)
                        }}
                      />
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Add a student
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the student number and LRN issued by the school.
                </p>
                <form className="mt-4 space-y-3" onSubmit={handleLinkStudent}>
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                      htmlFor="link_student_number"
                    >
                      Student number
                    </label>
                    <div className="relative">
                      <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="link_student_number"
                        required
                        value={studentNumber}
                        onChange={(event) =>
                          setStudentNumber(event.target.value.toUpperCase())
                        }
                        placeholder="e.g. STU-0001"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-sm uppercase outline-none transition placeholder:normal-case focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                      htmlFor="link_lrn_number"
                    >
                      LRN number
                    </label>
                    <div className="relative">
                      <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="link_lrn_number"
                        required
                        value={lrnNumber}
                        onChange={(event) => setLrnNumber(event.target.value)}
                        placeholder="e.g. 123456789012"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                  {linkError ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                    >
                      {linkError}
                    </p>
                  ) : null}
                  {linkSuccess ? (
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      {linkSuccess}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isLinking}
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isLinking ? 'Linking…' : 'Link student'}
                  </button>
                </form>
              </section>
            </div>
            )
          ) : null}
        </section>
      </div>

      {qrModalOpen && role === 'student' && qrValue ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-qr-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setQrModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close QR code"
            >
              <X className="h-5 w-5" />
            </button>
            <h2
              id="student-qr-title"
              className="pr-10 text-lg font-bold text-slate-950"
            >
              Student QR code
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Scan this code for {user?.full_name ?? 'the student'}.
            </p>
            <div className="mt-6 flex justify-center">
              <StudentNumberQr
                studentNumber={qrValue}
                size={260}
                className="!rounded-2xl !p-4"
              />
            </div>
            {studentProfile?.lrn_number ? (
              <p className="mt-4 text-xs text-slate-500">
                LRN {studentProfile.lrn_number}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  )
}
