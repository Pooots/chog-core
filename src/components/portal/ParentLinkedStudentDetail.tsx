import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  DoorOpen,
  GraduationCap,
  IdCard,
  UserRound,
  X,
} from 'lucide-react'
import StudentAcademicTabs, {
  type StudentAcademicTab,
} from '@/components/portal/StudentAcademicTabs'
import type { PortalParentStudent } from '@/types/auth'

export default function ParentLinkedStudentDetail({
  student,
  onBack,
  initialTab = 'room',
  initialQuarter,
  focusKey,
}: {
  student: PortalParentStudent
  onBack: () => void
  initialTab?: StudentAcademicTab
  initialQuarter?: number
  focusKey?: string | number
}) {
  const [infoOpen, setInfoOpen] = useState(false)

  const displayName =
    student.full_name ?? `${student.first_name} ${student.last_name}`.trim()

  const infoRows = useMemo(
    () =>
      [
        { label: 'Student number', value: student.student_number },
        { label: 'LRN', value: student.lrn_number },
        {
          label: 'Level',
          value:
            student.level?.name ??
            student.room?.level?.name ??
            'Not assigned',
        },
        {
          label: 'Room',
          value: student.room
            ? `${student.room.name} (${student.room.code})`
            : 'Not assigned',
        },
        {
          label: 'Building',
          value: student.room?.building?.trim() || '—',
        },
        {
          label: 'Enrollment',
          value: student.enrollment_status_label ?? student.status ?? '—',
        },
        {
          label: 'Gender',
          value: student.gender ? capitalize(student.gender) : '—',
        },
        { label: 'Birth date', value: student.birth_date ?? '—' },
        { label: 'Email', value: student.email?.trim() || '—' },
        { label: 'Phone', value: student.phone_number?.trim() || '—' },
        {
          label: 'Guardian',
          value: student.guardian_name?.trim() || '—',
        },
        {
          label: 'Guardian phone',
          value: student.guardian_phone?.trim() || '—',
        },
        {
          label: 'Enrollment date',
          value: student.enrollment_date ?? '—',
        },
        {
          label: 'Portal account',
          value: student.has_portal_account ? 'Enabled' : 'Not created',
        },
      ] as const,
    [student],
  )

  useEffect(() => {
    if (!infoOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInfoOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [infoOpen])

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to linked students
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <UserRound className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">{displayName}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {student.student_number} · LRN {student.lrn_number}
              </p>
              {student.enrollment_status_label ? (
                <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  {student.enrollment_status_label}
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-2 text-xs text-slate-500 sm:text-right">
            <p className="inline-flex items-center gap-1.5 sm:justify-end">
              <GraduationCap className="h-3.5 w-3.5" />
              {student.level?.name ??
                student.room?.level?.name ??
                'Level not assigned'}
            </p>
            <p className="inline-flex items-center gap-1.5 sm:justify-end">
              <DoorOpen className="h-3.5 w-3.5" />
              {student.room
                ? `${student.room.name} (${student.room.code})`
                : 'No room'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <IdCard className="h-4 w-4" />
          View information
        </button>
      </section>

      <div>
        <h3 className="text-sm font-bold text-slate-900">Academic details</h3>
        <p className="mt-1 text-xs text-slate-500">
          Room, schedule, attendance, entrance, grades, and teacher tasks for
          this student.
        </p>
        <div id="parent-student-academics">
          <StudentAcademicTabs
            studentUuid={student.uuid}
            initialTab={initialTab}
            initialQuarter={initialQuarter}
            focusKey={focusKey}
          />
        </div>
      </div>

      {infoOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="parent-student-info-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setInfoOpen(false)
          }}
        >
          <div className="flex max-h-[min(90dvh,40rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="parent-student-info-title"
                  className="text-base font-bold text-slate-950 sm:text-lg"
                >
                  Student information
                </h2>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {displayName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close student information"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {infoRows.map((row) => (
                  <article
                    key={row.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {row.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                      {row.value}
                    </p>
                  </article>
                ))}
              </div>

              {student.notes?.trim() ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Notes
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{student.notes}</p>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-slate-100 px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function LinkedStudentCard({
  student,
  onSelect,
}: {
  student: PortalParentStudent
  onSelect: () => void
}) {
  const displayName =
    student.full_name ?? `${student.first_name} ${student.last_name}`.trim()

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {student.student_number} · LRN {student.lrn_number}
          </p>
          {student.level?.name || student.room?.name ? (
            <p className="mt-1 truncate text-[11px] text-slate-400">
              {[student.level?.name, student.room?.name]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-blue-600" />
      </button>
    </li>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
