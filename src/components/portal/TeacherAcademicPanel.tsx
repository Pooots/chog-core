import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import axios from 'axios'
import {
  BookOpen,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  GraduationCap,
  IdCard,
  LoaderCircle,
  Plus,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { authService } from '@/services/authService'
import { portalAcademicService } from '@/services/portalAcademicService'
import type { PortalTeacherProfile } from '@/types/auth'
import type {
  AttendanceStatus,
  PortalAttendanceItem,
  PortalGradeItem,
  PortalScheduleItem,
  PortalTaskItem,
  ScheduleDay,
  TeacherAssignment,
  TeacherRoomStudent,
} from '@/types/portalAcademic'

type TeacherTab =
  | 'information'
  | 'students'
  | 'attendance'
  | 'schedule'
  | 'grades'
  | 'tasks'

const TABS: Array<{ id: TeacherTab; label: string; icon: typeof UserRound }> = [
  { id: 'information', label: 'Information', icon: IdCard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'tasks', label: 'Task', icon: ClipboardList },
]

const WEEK_DAYS: ScheduleDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const DAY_LABELS: Record<ScheduleDay, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

export default function TeacherAcademicPanel() {
  const [tab, setTab] = useState<TeacherTab>('information')
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedKey, setSelectedKey] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void portalAcademicService
      .getTeacherAssignments()
      .then((rows) => {
        if (cancelled) return
        setAssignments(rows)
        if (rows[0]) {
          setSelectedKey(`${rows[0].room_uuid}|${rows[0].subject_uuid}`)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load your teaching assignments.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selected = useMemo(
    () =>
      assignments.find(
        (row) => `${row.room_uuid}|${row.subject_uuid}` === selectedKey,
      ) ?? null,
    [assignments, selectedKey],
  )

  const needsAssignment =
    tab === 'students' ||
    tab === 'attendance' ||
    tab === 'grades' ||
    tab === 'tasks'

  return (
    <div className="mt-6 space-y-4">
      <div className="sticky top-0 z-20 -mx-1 overflow-x-auto bg-white/95 px-1 py-2 backdrop-blur">
        <div className="flex min-w-max gap-2">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading teaching workspace…
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!loading && !error && tab === 'information' ? (
        <TeacherInformationPanel />
      ) : null}

      {!loading && !error && tab === 'schedule' ? (
        <TeacherSchedulePanel />
      ) : null}

      {!loading &&
      !error &&
      needsAssignment &&
      assignments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-slate-300" />}
          title="No scheduled rooms yet"
          body="Ask the school admin to add you to a room schedule with a subject."
        />
      ) : null}

      {!loading && !error && needsAssignment && assignments.length > 0 ? (
        <>
          <label className="block text-xs font-semibold text-slate-700">
            Room / subject
            <select
              value={selectedKey}
              onChange={(event) => setSelectedKey(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              {assignments.map((row) => (
                <option
                  key={`${row.room_uuid}|${row.subject_uuid}`}
                  value={`${row.room_uuid}|${row.subject_uuid}`}
                >
                  {row.room?.name ?? 'Room'} ({row.room?.code}) ·{' '}
                  {row.subject?.name ?? 'Subject'}
                </option>
              ))}
            </select>
          </label>

          {selected && tab === 'students' ? (
            <TeacherStudentsPanel assignment={selected} />
          ) : null}
          {selected && tab === 'attendance' ? (
            <TeacherAttendancePanel assignment={selected} />
          ) : null}
          {selected && tab === 'grades' ? (
            <TeacherGradesPanel assignment={selected} />
          ) : null}
          {selected && tab === 'tasks' ? (
            <TeacherTasksPanel assignment={selected} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function TeacherInformationPanel() {
  const [profile, setProfile] = useState<PortalTeacherProfile | null>(
    () => authService.getProfile<PortalTeacherProfile>(),
  )
  const [school] = useState(() => authService.getSchool())
  const [user] = useState(() => authService.getCurrentUser())
  const [loading, setLoading] = useState(!profile)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    if (profile) return

    setLoading(true)
    void authService
      .me()
      .then((response) => {
        if (cancelled) return
        setProfile(response.profile as PortalTeacherProfile)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load teacher information.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [profile])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading information…
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    )
  }

  if (!profile) {
    return (
      <EmptyState
        icon={<UserRound className="h-8 w-8 text-slate-300" />}
        title="Profile unavailable"
        body="Your teacher profile could not be loaded."
      />
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <IdCard className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-900">Teacher information</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Your school profile and contact details.
      </p>

      <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-900">
              {profile.full_name}
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {profile.employee_id}
            </p>
          </div>
          {profile.status ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-emerald-700">
              {profile.status}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoRow
            icon={<Building2 className="h-4 w-4 text-slate-400" />}
            label="Department"
            value={profile.faculty?.name ?? 'Not assigned'}
          />
          <InfoRow
            icon={<GraduationCap className="h-4 w-4 text-slate-400" />}
            label="Position"
            value={profile.position_label ?? profile.position ?? '—'}
          />
          <InfoRow
            icon={<UserRound className="h-4 w-4 text-slate-400" />}
            label="Email"
            value={profile.email || user?.email || '—'}
          />
          <InfoRow
            icon={<IdCard className="h-4 w-4 text-slate-400" />}
            label="Phone"
            value={profile.phone_number?.trim() || '—'}
          />
          <InfoRow
            icon={<ClipboardList className="h-4 w-4 text-slate-400" />}
            label="PRC license"
            value={profile.prc_license?.trim() || '—'}
          />
          <InfoRow
            icon={<CalendarDays className="h-4 w-4 text-slate-400" />}
            label="Hire date"
            value={profile.hire_date ?? '—'}
          />
          <InfoRow
            icon={<Building2 className="h-4 w-4 text-slate-400" />}
            label="School"
            value={
              school
                ? `${school.name}${school.code ? ` (${school.code})` : ''}`
                : '—'
            }
          />
        </div>

        {profile.notes?.trim() ? (
          <p className="mt-4 rounded-xl bg-white px-3 py-2.5 text-sm text-slate-600">
            {profile.notes}
          </p>
        ) : null}
      </article>
    </section>
  )
}

function TeacherStudentsPanel({
  assignment,
}: {
  assignment: TeacherAssignment
}) {
  const [students, setStudents] = useState<TeacherRoomStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    void portalAcademicService
      .getRoomStudents(assignment.room_uuid, assignment.subject_uuid)
      .then((rows) => {
        if (!cancelled) setStudents(rows)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load students.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [assignment.room_uuid, assignment.subject_uuid])

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Room students</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Enrolled students in {assignment.room?.name ?? 'this room'}
          {assignment.subject?.name
            ? ` for ${assignment.subject.name}`
            : ''}
          .
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading students…</p>
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-slate-300" />}
          title="No students enrolled"
          body="This room does not have active students yet."
        />
      ) : (
        <ul className="space-y-3">
          {students.map((student) => (
            <li
              key={student.uuid}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {student.full_name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {student.student_number}
                    {student.lrn_number ? ` · LRN ${student.lrn_number}` : ''}
                  </p>
                </div>
                {student.enrollment_status_label ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    {student.enrollment_status_label}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                <p>Email: {student.email?.trim() || '—'}</p>
                <p>Phone: {student.phone_number?.trim() || '—'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const ATTENDANCE_STATUSES: Array<{
  value: AttendanceStatus
  label: string
  className: string
}> = [
  {
    value: 'present',
    label: 'Present',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    value: 'late',
    label: 'Late',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    value: 'absent',
    label: 'Absent',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    value: 'excused',
    label: 'Excused',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
]

function todayIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function TeacherAttendancePanel({
  assignment,
}: {
  assignment: TeacherAssignment
}) {
  const [view, setView] = useState<'daily' | 'record'>('daily')
  const [recordRefreshKey, setRecordRefreshKey] = useState(0)

  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            { id: 'daily', label: 'Daily' },
            { id: 'record', label: 'Attendance record' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              view === item.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {view === 'daily' ? (
        <TeacherDailyAttendancePanel
          assignment={assignment}
          onSaved={() => setRecordRefreshKey((value) => value + 1)}
        />
      ) : (
        <TeacherAttendanceRecordPanel
          assignment={assignment}
          refreshKey={recordRefreshKey}
        />
      )}
    </section>
  )
}

function attendanceStatusBadgeClass(status: string) {
  if (status === 'present') return 'bg-emerald-50 text-emerald-700'
  if (status === 'late') return 'bg-amber-50 text-amber-700'
  if (status === 'absent') return 'bg-red-50 text-red-700'
  if (status === 'excused') return 'bg-slate-100 text-slate-600'
  return 'bg-slate-100 text-slate-500'
}

function formatAttendanceDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function TeacherAttendanceRecordPanel({
  assignment,
  refreshKey,
}: {
  assignment: TeacherAssignment
  refreshKey: number
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [records, setRecords] = useState<PortalAttendanceItem[]>([])
  const [summary, setSummary] = useState({
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    total: 0,
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    void portalAcademicService
      .getTeacherAttendanceRecords({
        room_uuid: assignment.room_uuid,
        subject_uuid: assignment.subject_uuid,
      })
      .then((response) => {
        if (cancelled) return
        setRecords(response.records)
        setSummary(response.summary)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load attendance records.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [assignment.room_uuid, assignment.subject_uuid, refreshKey])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Attendance record
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Present, late, and absent history for{' '}
          {assignment.room?.name ?? 'this room'} ·{' '}
          {assignment.subject?.name ?? 'subject'}.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              {
                key: 'present',
                label: 'Present',
                value: summary.present,
                className: 'bg-emerald-50 text-emerald-800',
              },
              {
                key: 'late',
                label: 'Late',
                value: summary.late,
                className: 'bg-amber-50 text-amber-800',
              },
              {
                key: 'absent',
                label: 'Absent',
                value: summary.absent,
                className: 'bg-red-50 text-red-800',
              },
              {
                key: 'excused',
                label: 'Excused',
                value: summary.excused,
                className: 'bg-slate-100 text-slate-700',
              },
            ] as const
          ).map((item) => (
            <div
              key={item.key}
              className={`rounded-2xl px-3 py-3 ${item.className}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading attendance records…</p>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck2 className="h-8 w-8 text-slate-300" />}
          title="No attendance yet"
          body="Saved daily attendance for this room and subject will appear here."
        />
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {records.map((record, index) => (
            <li
              key={record.uuid}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                index > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {record.student?.full_name ?? 'Student'}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {formatAttendanceDate(record.attendance_date)}
                  {record.student?.student_number
                    ? ` · ${record.student.student_number}`
                    : ''}
                </p>
                {record.remarks ? (
                  <p className="mt-1 text-xs text-slate-500">{record.remarks}</p>
                ) : null}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${attendanceStatusBadgeClass(
                  record.status,
                )}`}
              >
                {record.status_label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TeacherDailyAttendancePanel({
  assignment,
  onSaved,
}: {
  assignment: TeacherAssignment
  onSaved?: () => void
}) {
  const [genderFilter, setGenderFilter] = useState<'male' | 'female'>('male')
  const [attendanceDate, setAttendanceDate] = useState(todayIsoDate)
  const [students, setStudents] = useState<TeacherRoomStudent[]>([])
  const [drafts, setDrafts] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setSuccess('')

    void Promise.all([
      portalAcademicService.getRoomStudents(
        assignment.room_uuid,
        assignment.subject_uuid,
      ),
      portalAcademicService.getTeacherAttendance({
        room_uuid: assignment.room_uuid,
        subject_uuid: assignment.subject_uuid,
        attendance_date: attendanceDate,
      }),
    ])
      .then(([studentRows, attendanceRows]) => {
        if (cancelled) return
        setStudents(studentRows)
        const byStudent = new Map<string, PortalAttendanceItem>()
        for (const row of attendanceRows) {
          byStudent.set(row.student_uuid, row)
        }
        const next: Record<
          string,
          { status: AttendanceStatus; remarks: string }
        > = {}
        for (const student of studentRows) {
          const existing = byStudent.get(student.uuid)
          next[student.uuid] = {
            status: (existing?.status as AttendanceStatus) || 'present',
            remarks: existing?.remarks ?? '',
          }
        }
        setDrafts(next)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load attendance.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [assignment.room_uuid, assignment.subject_uuid, attendanceDate])

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) => student.gender?.toLowerCase() === genderFilter,
      ),
    [genderFilter, students],
  )

  const markAll = (status: AttendanceStatus) => {
    setDrafts((current) => {
      const next = { ...current }
      for (const student of filteredStudents) {
        next[student.uuid] = {
          status,
          remarks: next[student.uuid]?.remarks ?? '',
        }
      }
      return next
    })
  }

  const confirmSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await portalAcademicService.upsertAttendance({
        room_uuid: assignment.room_uuid,
        subject_uuid: assignment.subject_uuid,
        attendance_date: attendanceDate,
        records: students.map((student) => ({
          student_uuid: student.uuid,
          status: drafts[student.uuid]?.status ?? 'present',
          remarks: drafts[student.uuid]?.remarks?.trim() || undefined,
        })),
      })
      setSuccess(`Attendance saved for ${attendanceDate}.`)
      setConfirmOpen(false)
      onSaved?.()
    } catch (requestError) {
      setError(extractError(requestError, 'Unable to save attendance.'))
      setConfirmOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const counts = useMemo(() => {
    const next = { present: 0, late: 0, absent: 0, excused: 0 }
    for (const student of filteredStudents) {
      const status = drafts[student.uuid]?.status ?? 'present'
      next[status] += 1
    }
    return next
  }, [drafts, filteredStudents])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Daily attendance</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Mark attendance for {assignment.room?.name ?? 'this room'} ·{' '}
          {assignment.subject?.name ?? 'subject'}.
        </p>

        <label className="mt-4 block text-xs font-semibold text-slate-700">
          Date
          <input
            type="date"
            value={attendanceDate}
            onChange={(event) => setAttendanceDate(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:max-w-xs"
          />
        </label>

        <div className="mt-4 flex gap-2">
          {(['male', 'female'] as const).map((gender) => {
            const count = students.filter(
              (student) => student.gender?.toLowerCase() === gender,
            ).length
            return (
              <button
                key={gender}
                type="button"
                onClick={() => setGenderFilter(gender)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition ${
                  genderFilter === gender
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {gender} ({count})
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ATTENDANCE_STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => markAll(status.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Mark all {status.label}
            </button>
          ))}
        </div>

        {!loading && filteredStudents.length > 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            Present {counts.present} · Late {counts.late} · Absent{' '}
            {counts.absent} · Excused {counts.excused}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading attendance…</p>
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-slate-300" />}
          title="No students enrolled"
          body="Add students to this room before recording attendance."
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-slate-300" />}
          title={`No ${genderFilter} students`}
          body={`This room has no ${genderFilter} students enrolled.`}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const draft = drafts[student.uuid]
                    return (
                      <tr
                        key={student.uuid}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">
                            {student.full_name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {student.student_number}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {ATTENDANCE_STATUSES.map((status) => {
                              const active = draft?.status === status.value
                              return (
                                <button
                                  key={status.value}
                                  type="button"
                                  onClick={() =>
                                    setDrafts((current) => ({
                                      ...current,
                                      [student.uuid]: {
                                        status: status.value,
                                        remarks:
                                          current[student.uuid]?.remarks ?? '',
                                      },
                                    }))
                                  }
                                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                    active
                                      ? status.className
                                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {status.label}
                                </button>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={draft?.remarks ?? ''}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [student.uuid]: {
                                  status:
                                    current[student.uuid]?.status ?? 'present',
                                  remarks: event.target.value,
                                },
                              }))
                            }
                            placeholder="Optional remarks"
                            className="h-10 w-full min-w-52 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={saving}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save attendance'}
          </button>
        </>
      )}

      <ConfirmModal
        open={confirmOpen}
        tone="primary"
        title="Save attendance for this day?"
        description={`Save attendance for ${students.length} student${students.length === 1 ? '' : 's'} on ${attendanceDate}.`}
        confirmLabel="Save attendance"
        pending={saving}
        onCancel={() => {
          if (!saving) setConfirmOpen(false)
        }}
        onConfirm={() => void confirmSave()}
      />
    </div>
  )
}

function TeacherSchedulePanel() {
  const [schedules, setSchedules] = useState<PortalScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    void portalAcademicService
      .getTeacherSchedules()
      .then((rows) => {
        if (!cancelled) setSchedules(rows)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load your schedule.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const schedulesByDay = useMemo(() => {
    const map = new Map<ScheduleDay, PortalScheduleItem[]>()
    WEEK_DAYS.forEach((day) => map.set(day, []))
    for (const item of schedules) {
      const list = map.get(item.day_of_week) ?? []
      list.push(item)
      map.set(item.day_of_week, list)
    }
    map.forEach((items) => {
      items.sort((a, b) => a.start_time.localeCompare(b.start_time))
    })
    return map
  }, [schedules])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading schedule…
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Weekly schedule</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Your teaching periods across assigned rooms, including shared breaks.
        </p>
      </div>

      {schedules.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8 text-slate-300" />}
          title="No schedule yet"
          body="You are not assigned to any room periods yet."
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {WEEK_DAYS.map((day) => {
              const items = schedulesByDay.get(day) ?? []
              if (items.length === 0) return null
              return (
                <article
                  key={day}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <h3 className="text-sm font-bold text-slate-900">
                    {DAY_LABELS[day]}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {items.map((item) => (
                      <li
                        key={item.uuid}
                        className="rounded-xl bg-slate-50 px-3 py-2.5"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {scheduleTitle(item)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.start_time} – {item.end_time}
                          {item.room?.name ? ` · ${item.room.name}` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <div className="grid min-w-[720px] grid-cols-7 gap-2">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                    {DAY_LABELS[day]}
                  </p>
                  <div className="mt-3 space-y-2">
                    {(schedulesByDay.get(day) ?? []).map((item) => (
                      <div
                        key={item.uuid}
                        className={`rounded-xl px-2.5 py-2 ${
                          item.period_type === 'break'
                            ? 'bg-amber-50'
                            : item.period_type === 'recess'
                              ? 'bg-orange-50'
                              : 'bg-blue-50'
                        }`}
                      >
                        <p className="text-[11px] font-bold text-slate-800">
                          {item.start_time}-{item.end_time}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          {item.period_type && item.period_type !== 'class'
                            ? item.period_label ||
                              (item.period_type === 'recess'
                                ? 'Recess'
                                : 'Break')
                            : (item.subject?.code ?? 'TBD')}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                          {item.period_type && item.period_type !== 'class' ? (
                            item.notes?.trim() || '—'
                          ) : (
                            <>
                              <DoorOpen className="h-3 w-3" />
                              {item.room?.name ?? 'No room'}
                            </>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function scheduleTitle(item: PortalScheduleItem) {
  if (item.period_type && item.period_type !== 'class') {
    return item.notes?.trim() || item.period_label || 'Break'
  }
  return item.subject?.name ?? 'Subject TBD'
}

function TeacherTasksPanel({ assignment }: { assignment: TeacherAssignment }) {
  const [tasks, setTasks] = useState<PortalTaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PortalTaskItem | null>(
    null,
  )
  const [pendingComplete, setPendingComplete] = useState<PortalTaskItem | null>(
    null,
  )
  const [actionPending, setActionPending] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await portalAcademicService.getTeacherTasks({
        room_uuid: assignment.room_uuid,
        subject_uuid: assignment.subject_uuid,
      })
      setTasks(rows)
    } catch {
      setError('Unable to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [assignment.room_uuid, assignment.subject_uuid])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await portalAcademicService.createTeacherTask({
        room_uuid: assignment.room_uuid,
        subject_uuid: assignment.subject_uuid,
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
      })
      setTitle('')
      setDescription('')
      setDueDate('')
      await load()
    } catch (requestError) {
      setError(extractError(requestError, 'Unable to create task.'))
    } finally {
      setSaving(false)
    }
  }

  const confirmComplete = async () => {
    if (!pendingComplete) return
    setActionPending(true)
    setError('')
    try {
      await portalAcademicService.updateTeacherTask(pendingComplete.uuid, {
        status: 'completed',
      })
      setPendingComplete(null)
      await load()
    } catch (requestError) {
      setError(extractError(requestError, 'Unable to update task.'))
      setPendingComplete(null)
    } finally {
      setActionPending(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setActionPending(true)
    setError('')
    try {
      await portalAcademicService.deleteTeacherTask(pendingDelete.uuid)
      setPendingDelete(null)
      await load()
    } catch (requestError) {
      setError(extractError(requestError, 'Unable to delete task.'))
      setPendingDelete(null)
    } finally {
      setActionPending(false)
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Create task</h3>
        </div>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Post task'}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No tasks for this room and subject yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.uuid}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{task.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Due {task.due_date ?? '—'} · {task.status_label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(task)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {task.description ? (
                <p className="mt-2 text-sm text-slate-600">{task.description}</p>
              ) : null}
              {task.status !== 'completed' ? (
                <button
                  type="button"
                  onClick={() => setPendingComplete(task)}
                  className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  Mark completed
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(pendingComplete)}
        tone="primary"
        title="Mark task as completed?"
        description={
          pendingComplete
            ? `Update “${pendingComplete.title}” to completed.`
            : undefined
        }
        confirmLabel="Mark completed"
        pending={actionPending}
        onCancel={() => {
          if (!actionPending) setPendingComplete(null)
        }}
        onConfirm={() => void confirmComplete()}
      />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        tone="danger"
        title="Delete this task?"
        description={
          pendingDelete
            ? `This will permanently remove “${pendingDelete.title}”.`
            : undefined
        }
        confirmLabel="Delete task"
        pending={actionPending}
        onCancel={() => {
          if (!actionPending) setPendingDelete(null)
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}

function TeacherGradesPanel({ assignment }: { assignment: TeacherAssignment }) {
  const [quarter, setQuarter] = useState(1)
  const [students, setStudents] = useState<TeacherRoomStudent[]>([])
  const [grades, setGrades] = useState<PortalGradeItem[]>([])
  const [drafts, setDrafts] = useState<
    Record<string, { grade: string; remarks: string }>
  >({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingStudent, setPendingStudent] =
    useState<TeacherRoomStudent | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setSuccess('')

    void Promise.all([
      portalAcademicService.getRoomStudents(
        assignment.room_uuid,
        assignment.subject_uuid,
      ),
      portalAcademicService.getTeacherGrades({
        room_uuid: assignment.room_uuid,
        subject_uuid: assignment.subject_uuid,
        quarter,
      }),
    ])
      .then(([studentRows, gradeRows]) => {
        if (cancelled) return
        setStudents(studentRows)
        setGrades(gradeRows)
        const next: Record<string, { grade: string; remarks: string }> = {}
        for (const student of studentRows) {
          const existing = gradeRows.find(
            (grade) => grade.student?.uuid === student.uuid,
          )
          next[student.uuid] = {
            grade: existing?.grade != null ? String(existing.grade) : '',
            remarks: existing?.remarks ?? '',
          }
        }
        setDrafts(next)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load grades.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [assignment.room_uuid, assignment.subject_uuid, quarter])

  const requestSaveGrade = (student: TeacherRoomStudent) => {
    const draft = drafts[student.uuid]
    const value = Number(draft?.grade)
    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError('Grade must be a number from 0 to 100.')
      return
    }
    setError('')
    setPendingStudent(student)
  }

  const confirmSaveGrade = async () => {
    if (!pendingStudent) return
    const draft = drafts[pendingStudent.uuid]
    const value = Number(draft?.grade)
    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError('Grade must be a number from 0 to 100.')
      setPendingStudent(null)
      return
    }

    setSavingId(pendingStudent.uuid)
    setError('')
    setSuccess('')
    try {
      const saved = await portalAcademicService.upsertGrade({
        student_uuid: pendingStudent.uuid,
        room_uuid: assignment.room_uuid,
        subject_uuid: assignment.subject_uuid,
        quarter,
        grade: value,
        remarks: draft?.remarks?.trim() || undefined,
      })
      setGrades((current) => {
        const others = current.filter(
          (item) => item.student?.uuid !== pendingStudent.uuid,
        )
        return [...others, saved]
      })
      setSuccess(`Saved grade for ${pendingStudent.full_name}.`)
      setPendingStudent(null)
    } catch (requestError) {
      setError(extractError(requestError, 'Unable to save grade.'))
      setPendingStudent(null)
    } finally {
      setSavingId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Term grades</h3>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {[1, 2, 3].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setQuarter(value)}
              className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-semibold ${
                quarter === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Term {value}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading students…</p>
      ) : students.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No students enrolled in this room.
        </p>
      ) : (
        <ul className="space-y-3">
          {students.map((student) => (
            <li
              key={student.uuid}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-bold text-slate-900">
                {student.full_name}
              </p>
              <p className="text-xs text-slate-500">{student.student_number}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[120px_1fr_auto]">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={drafts[student.uuid]?.grade ?? ''}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [student.uuid]: {
                        grade: event.target.value,
                        remarks: current[student.uuid]?.remarks ?? '',
                      },
                    }))
                  }
                  placeholder="0-100"
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <input
                  value={drafts[student.uuid]?.remarks ?? ''}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [student.uuid]: {
                        grade: current[student.uuid]?.grade ?? '',
                        remarks: event.target.value,
                      },
                    }))
                  }
                  placeholder="Remarks"
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  disabled={savingId === student.uuid}
                  onClick={() => requestSaveGrade(student)}
                  className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingId === student.uuid ? 'Saving…' : 'Save'}
                </button>
              </div>
              {grades.find((grade) => grade.student?.uuid === student.uuid) ? (
                <p className="mt-2 text-[11px] text-emerald-600">
                  Saved for Term {quarter}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(pendingStudent)}
        tone="primary"
        title="Save grade update?"
        description={
          pendingStudent
            ? `Save Term ${quarter} grade for ${pendingStudent.full_name}.`
            : undefined
        }
        confirmLabel="Save grade"
        pending={Boolean(savingId)}
        onCancel={() => {
          if (!savingId) setPendingStudent(null)
        }}
        onConfirm={() => void confirmSaveGrade()}
      />
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <div className="mx-auto w-fit">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{body}</p>
    </div>
  )
}

function extractError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  const data = error.response?.data as
    | { message?: string; errors?: Record<string, string[]> }
    | undefined
  const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
  return first ?? data?.message ?? fallback
}
