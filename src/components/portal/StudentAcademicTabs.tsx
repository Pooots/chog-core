import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BookOpen,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  GraduationCap,
  LoaderCircle,
  ScanLine,
  Users,
} from 'lucide-react'
import { portalAcademicService } from '@/services/portalAcademicService'
import type {
  AttendanceStatus,
  PortalAttendanceItem,
  PortalEntranceItem,
  PortalGradeQuarterGroup,
  PortalScheduleItem,
  PortalTaskItem,
  ScheduleDay,
  StudentAcademicsResponse,
} from '@/types/portalAcademic'

export type StudentAcademicTab =
  | 'room'
  | 'schedule'
  | 'attendance'
  | 'entrance'
  | 'grades'
  | 'tasks'

type StudentTab = StudentAcademicTab

const TABS: Array<{ id: StudentTab; label: string; icon: typeof DoorOpen }> = [
  { id: 'room', label: 'Room', icon: DoorOpen },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
  { id: 'entrance', label: 'Entrance', icon: ScanLine },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'tasks', label: 'Teacher Task', icon: ClipboardList },
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

function statusClass(status: string) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700'
  if (status === 'cancelled') return 'bg-slate-100 text-slate-500'
  return 'bg-amber-50 text-amber-700'
}

function attendanceStatusClass(status: string) {
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

function formatEntranceDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function entranceDirectionClass(direction: string) {
  if (direction === 'in') return 'bg-emerald-50 text-emerald-700'
  if (direction === 'out') return 'bg-amber-50 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

export default function StudentAcademicTabs({
  studentUuid,
  initialTab = 'room',
  initialQuarter,
  focusKey,
}: {
  /** When set, loads academics as a parent for this linked student. */
  studentUuid?: string
  initialTab?: StudentAcademicTab
  initialQuarter?: number
  /** Change this to force tab/quarter focus (e.g. from a notification click). */
  focusKey?: string | number
} = {}) {
  const [tab, setTab] = useState<StudentTab>(initialTab)
  const [quarter, setQuarter] = useState(initialQuarter ?? 1)
  const [data, setData] = useState<StudentAcademicsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setTab(initialTab)
    if (initialQuarter != null && initialQuarter >= 1 && initialQuarter <= 3) {
      setQuarter(initialQuarter)
    }
  }, [focusKey, initialTab, initialQuarter])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const request = studentUuid
      ? portalAcademicService.getParentStudentAcademics(studentUuid)
      : portalAcademicService.getStudentAcademics()

    void request
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load academic details.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [studentUuid])

  const schedulesByDay = useMemo(() => {
    const map = new Map<ScheduleDay, PortalScheduleItem[]>()
    WEEK_DAYS.forEach((day) => map.set(day, []))
    for (const item of data?.schedules ?? []) {
      const list = map.get(item.day_of_week) ?? []
      list.push(item)
      map.set(item.day_of_week, list)
    }
    return map
  }, [data?.schedules])

  const quarterGroup: PortalGradeQuarterGroup | null = useMemo(() => {
    const groups = data?.grades_by_quarter
    if (!groups) return null
    return groups[String(quarter)] ?? groups[quarter as unknown as string] ?? null
  }, [data?.grades_by_quarter, quarter])

  const totalAverage = useMemo(() => {
    const groups = data?.grades_by_quarter
    if (!groups) return null

    const grades = Object.values(groups).flatMap((group) =>
      group.grades
        .map((item) => item.grade)
        .filter((grade): grade is number => grade != null),
    )

    if (grades.length === 0) return null
    return grades.reduce((sum, grade) => sum + grade, 0) / grades.length
  }, [data?.grades_by_quarter])

  const tasks: PortalTaskItem[] = data?.tasks ?? []
  const room = data?.room
  const attendanceSummary = data?.attendance?.summary
  const attendanceRecords: PortalAttendanceItem[] =
    data?.attendance?.records ?? []
  const entranceSummary = data?.entrances?.summary
  const entranceRecords: PortalEntranceItem[] = data?.entrances?.records ?? []

  return (
    <div id="student-academics" className="mt-6 space-y-4">
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
          Loading…
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!loading && !error && tab === 'room' ? (
        <div>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Your room</h2>
            </div>
            {room ? (
              <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {room.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {room.code}
                    </p>
                  </div>
                  {data?.student.enrollment_status_label ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      {data.student.enrollment_status_label}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    icon={<GraduationCap className="h-4 w-4 text-slate-400" />}
                    label="Level"
                    value={
                      room.level?.name ??
                      data?.student.level?.name ??
                      'Not assigned'
                    }
                  />
                  <InfoRow
                    icon={<Building2 className="h-4 w-4 text-slate-400" />}
                    label="Building"
                    value={room.building?.trim() || '—'}
                  />
                  <InfoRow
                    icon={<Users className="h-4 w-4 text-slate-400" />}
                    label="Capacity"
                    value={
                      room.capacity != null ? `${room.capacity} seats` : '—'
                    }
                  />
                </div>
              </article>
            ) : (
              <EmptyState
                icon={<DoorOpen className="h-8 w-8 text-slate-300" />}
                title="No room assigned yet"
                body="Ask your registrar to place you in a room or section."
              />
            )}
          </section>
        </div>
      ) : null}

      {!loading && !error && tab === 'schedule' ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Room schedule
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Weekly timetable for your assigned room.
            </p>
          </div>

          {(data?.schedules.length ?? 0) === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-8 w-8 text-slate-300" />}
              title="No schedule yet"
              body="Your room does not have class periods posted."
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
                              {item.period_type && item.period_type !== 'class'
                                ? item.notes?.trim() ||
                                  item.period_label ||
                                  'Break'
                                : (item.subject?.name ?? 'Subject TBD')}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {item.start_time} – {item.end_time}
                              {item.teacher?.full_name
                                ? ` · ${item.teacher.full_name}`
                                : ''}
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
                            className="rounded-xl bg-blue-50 px-2.5 py-2"
                          >
                            <p className="text-[11px] font-bold text-blue-900">
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
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {item.period_type && item.period_type !== 'class'
                                ? item.notes?.trim() || '—'
                                : (item.teacher?.full_name ?? 'No teacher')}
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
      ) : null}

      {!loading && !error && tab === 'attendance' ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Attendance record
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Present, late, and absent days recorded by your teachers.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  {
                    key: 'present',
                    label: 'Present',
                    value: attendanceSummary?.present ?? 0,
                    className: 'bg-emerald-50 text-emerald-800',
                  },
                  {
                    key: 'late',
                    label: 'Late',
                    value: attendanceSummary?.late ?? 0,
                    className: 'bg-amber-50 text-amber-800',
                  },
                  {
                    key: 'absent',
                    label: 'Absent',
                    value: attendanceSummary?.absent ?? 0,
                    className: 'bg-red-50 text-red-800',
                  },
                  {
                    key: 'excused',
                    label: 'Excused',
                    value: attendanceSummary?.excused ?? 0,
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

          {attendanceRecords.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck2 className="h-8 w-8 text-slate-300" />}
              title="No attendance yet"
              body="When teachers mark attendance for your class, it will show here."
            />
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {attendanceRecords.map((record, index) => (
                <li
                  key={record.uuid}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                    index > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {formatAttendanceDate(record.attendance_date)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {record.subject?.name ?? 'Subject'}
                      {record.room?.name ? ` · ${record.room.name}` : ''}
                    </p>
                    {record.remarks ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {record.remarks}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${attendanceStatusClass(
                      record.status as AttendanceStatus,
                    )}`}
                  >
                    {record.status_label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {!loading && !error && tab === 'entrance' ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Entrance record
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Campus enter and exit scans recorded at the school gate.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {(
                [
                  {
                    key: 'in',
                    label: 'Entered',
                    value: entranceSummary?.in ?? 0,
                    className: 'bg-emerald-50 text-emerald-800',
                  },
                  {
                    key: 'out',
                    label: 'Exited',
                    value: entranceSummary?.out ?? 0,
                    className: 'bg-amber-50 text-amber-800',
                  },
                  {
                    key: 'total',
                    label: 'Total scans',
                    value: entranceSummary?.total ?? 0,
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

          {entranceRecords.length === 0 ? (
            <EmptyState
              icon={<ScanLine className="h-8 w-8 text-slate-300" />}
              title="No entrance scans yet"
              body="When your student number is scanned at the gate, it will appear here."
            />
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {entranceRecords.map((record, index) => (
                <li
                  key={record.uuid}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                    index > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {formatEntranceDateTime(record.scanned_at)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {record.scanned_identifier
                        ? `Scanned ${record.scanned_identifier}`
                        : 'Gate scan'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${entranceDirectionClass(
                      record.direction,
                    )}`}
                  >
                    {record.direction_label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {!loading && !error && tab === 'grades' ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Personal grades
                  </h2>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setQuarter(value)}
                      className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-semibold transition ${
                        quarter === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Term {value}
                    </button>
                  ))}
                </div>
                {quarterGroup?.average != null ? (
                  <p className="mt-4 text-sm text-slate-600">
                    Term {quarter} average:{' '}
                    <span className="font-bold text-slate-900">
                      {quarterGroup.average.toFixed(2)}%
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="shrink-0 rounded-2xl bg-blue-600 px-5 py-4 text-right shadow-lg shadow-blue-600/20">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                  Total average
                </p>
                <p className="mt-1 text-3xl font-black tracking-tight text-white">
                  {totalAverage != null ? `${totalAverage.toFixed(2)}%` : '—'}
                </p>
              </div>
            </div>
          </div>

          {(quarterGroup?.grades.length ?? 0) === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8 text-slate-300" />}
              title="No subjects yet"
              body="Your school has not added subjects yet."
            />
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {quarterGroup?.grades.map((grade, index) => {
                const hasGrade = grade.grade != null
                return (
                  <li
                    key={grade.uuid ?? grade.subject_uuid ?? grade.subject?.uuid ?? index}
                    className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                      index > 0 ? 'border-t border-slate-100' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {grade.subject?.name ?? 'Subject'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {grade.subject?.code ?? '—'}
                        {grade.teacher?.full_name
                          ? ` · ${grade.teacher.full_name}`
                          : ''}
                      </p>
                      {grade.remarks ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {grade.remarks}
                        </p>
                      ) : null}
                    </div>
                    {hasGrade ? (
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                        {Number(grade.grade).toFixed(2)}%
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        Pending
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {!loading && !error && tab === 'tasks' ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Teacher tasks
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Assignments and tasks from teachers in your room.
            </p>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-8 w-8 text-slate-300" />}
              title="No teacher tasks"
              body="When teachers post tasks for your room, they will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.uuid}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {task.subject?.name ?? 'Subject'}
                        {task.teacher?.full_name
                          ? ` · ${task.teacher.full_name}`
                          : ''}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(task.status)}`}
                    >
                      {task.status_label}
                    </span>
                  </div>
                  {task.description ? (
                    <p className="mt-3 text-sm text-slate-600">
                      {task.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-slate-400">
                    Due {task.due_date ?? '—'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
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
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="font-semibold text-slate-800">{value}</p>
      </div>
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
