import { useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  DoorOpen,
  Plus,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import type {
  ScheduleDay,
  TeacherSchedule,
} from '@/services/teacherScheduleService'
import {
  useTeacherQuery,
  useTeacherSchedulesQuery,
} from '@/hooks/useSchoolQueries'

const WEEK_DAYS: Array<{ value: ScheduleDay; label: string; short: string }> = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
]

const EVENT_COLORS = [
  'border-blue-200 bg-blue-50 text-blue-800',
  'border-cyan-200 bg-cyan-50 text-cyan-800',
  'border-sky-200 bg-sky-50 text-sky-800',
  'border-indigo-200 bg-indigo-50 text-indigo-800',
  'border-teal-200 bg-teal-50 text-teal-800',
]

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:00 ${suffix}`
}

function colorForSchedule(schedule: TeacherSchedule, index: number) {
  if (schedule.period_type === 'break') {
    return 'border-amber-200 bg-amber-50 text-amber-800'
  }
  if (schedule.period_type === 'recess') {
    return 'border-orange-200 bg-orange-50 text-orange-800'
  }
  const key = schedule.subject?.code ?? schedule.uuid
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % EVENT_COLORS.length
  }
  return EVENT_COLORS[(hash + index) % EVENT_COLORS.length]
}

function scheduleTitle(schedule: TeacherSchedule) {
  if (schedule.period_type === 'break') {
    return schedule.notes?.trim() || 'Break'
  }
  if (schedule.period_type === 'recess') {
    return schedule.notes?.trim() || 'Recess'
  }
  return schedule.subject?.name ?? 'Class'
}

function scheduleCode(schedule: TeacherSchedule) {
  if (schedule.period_type === 'break') return 'BRK'
  if (schedule.period_type === 'recess') return 'REC'
  return schedule.subject?.code ?? 'N/A'
}

export default function TeacherSchedulesPage() {
  const { teacherUuid } = useParams({
    from: '/admin/teachers/$teacherUuid/schedules',
  })
  const teacherQuery = useTeacherQuery(teacherUuid)
  const schedulesQuery = useTeacherSchedulesQuery(teacherUuid)
  const teacher = teacherQuery.data
  const schedules = schedulesQuery.data ?? []

  const showInitialLoading =
    (teacherQuery.isPending || schedulesQuery.isPending) && !teacher

  const activeSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.status === 'active'),
    [schedules],
  )

  const { startHour, endHour, hourSlots } = useMemo(() => {
    if (activeSchedules.length === 0) {
      const start = 7
      const end = 17
      return {
        startHour: start,
        endHour: end,
        hourSlots: Array.from({ length: end - start }, (_, i) => start + i),
      }
    }

    const minutes = activeSchedules.flatMap((schedule) => [
      timeToMinutes(schedule.start_time),
      timeToMinutes(schedule.end_time),
    ])
    const minHour = Math.max(0, Math.floor(Math.min(...minutes) / 60) - 1)
    const maxHour = Math.min(23, Math.ceil(Math.max(...minutes) / 60) + 1)
    const start = Math.min(minHour, 7)
    const end = Math.max(maxHour, start + 1)

    return {
      startHour: start,
      endHour: end,
      hourSlots: Array.from({ length: end - start }, (_, i) => start + i),
    }
  }, [activeSchedules])

  const schedulesByDay = useMemo(() => {
    const map = new Map<ScheduleDay, TeacherSchedule[]>()
    WEEK_DAYS.forEach((day) => map.set(day.value, []))
    activeSchedules.forEach((schedule) => {
      map.get(schedule.day_of_week)?.push(schedule)
    })
    map.forEach((items) => {
      items.sort(
        (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
      )
    })
    return map
  }, [activeSchedules])

  const totalMinutes = (endHour - startHour) * 60
  const rowHeight = 64

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <Link
            to="/admin/teachers"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teachers
          </Link>

          {showInitialLoading ? (
            <p className="mt-6 text-sm text-slate-500">Loading schedule…</p>
          ) : null}

          {teacherQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this teacher.
            </div>
          ) : null}

          {teacher ? (
            <>
              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      Weekly Calendar
                    </h1>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {teacher.full_name} · {teacher.employee_id}
                    {teacher.faculty ? ` · ${teacher.faculty.name}` : ''}
                  </p>
                </div>
                <Link
                  to="/admin/teachers/$teacherUuid/schedules/create"
                  params={{ teacherUuid }}
                  className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Schedule
                </Link>
              </div>

              {schedulesQuery.isError ? (
                <p role="alert" className="mt-6 text-sm text-red-600">
                  Unable to load schedules.
                </p>
              ) : null}

              {!schedulesQuery.isPending &&
              !schedulesQuery.isError &&
              activeSchedules.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No schedules yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Room schedules assigned to this teacher will appear here,
                    or create a schedule directly.
                  </p>
                  <Link
                    to="/admin/teachers/$teacherUuid/schedules/create"
                    params={{ teacherUuid }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Create Schedule
                  </Link>
                </div>
              ) : null}

              {activeSchedules.length > 0 ? (
                <>
                  <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <div className="min-w-[980px]">
                        <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50">
                          <div className="px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Time
                          </div>
                          {WEEK_DAYS.map((day) => {
                            const count =
                              schedulesByDay.get(day.value)?.length ?? 0
                            return (
                              <div
                                key={day.value}
                                className="border-l border-slate-200 px-2 py-3 text-center"
                              >
                                <p className="text-xs font-bold text-slate-800">
                                  {day.short}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  {count} class{count === 1 ? '' : 'es'}
                                </p>
                              </div>
                            )
                          })}
                        </div>

                        <div className="relative grid grid-cols-[72px_repeat(7,minmax(0,1fr))]">
                          <div>
                            {hourSlots.map((hour) => (
                              <div
                                key={hour}
                                style={{ height: rowHeight }}
                                className="border-b border-slate-100 px-2 pt-1 text-[10px] font-medium text-slate-400"
                              >
                                {formatHour(hour)}
                              </div>
                            ))}
                          </div>

                          {WEEK_DAYS.map((day) => {
                            const daySchedules =
                              schedulesByDay.get(day.value) ?? []
                            return (
                              <div
                                key={day.value}
                                className="relative border-l border-slate-100"
                                style={{
                                  height: hourSlots.length * rowHeight,
                                }}
                              >
                                {hourSlots.map((hour) => (
                                  <div
                                    key={`${day.value}-${hour}`}
                                    style={{ height: rowHeight }}
                                    className="border-b border-slate-100"
                                  />
                                ))}

                                {daySchedules.map((schedule, index) => {
                                  const start =
                                    timeToMinutes(schedule.start_time) -
                                    startHour * 60
                                  const end =
                                    timeToMinutes(schedule.end_time) -
                                    startHour * 60
                                  const top =
                                    (Math.max(start, 0) / totalMinutes) *
                                    hourSlots.length *
                                    rowHeight
                                  const height = Math.max(
                                    ((end - start) / totalMinutes) *
                                      hourSlots.length *
                                      rowHeight,
                                    44,
                                  )

                                  return (
                                    <article
                                      key={schedule.uuid}
                                      className={`absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1.5 shadow-sm ${colorForSchedule(schedule, index)}`}
                                      style={{ top, height }}
                                      title={`${scheduleTitle(schedule)} · ${schedule.start_time}–${schedule.end_time}`}
                                    >
                                      <p className="truncate text-[11px] font-bold">
                                        {scheduleTitle(schedule)}
                                      </p>
                                      <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-80">
                                        <Clock3 className="h-3 w-3" />
                                        {schedule.start_time}–{schedule.end_time}
                                      </p>
                                      {schedule.room && height > 56 ? (
                                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-80">
                                          <DoorOpen className="h-3 w-3" />
                                          {schedule.room.name}
                                        </p>
                                      ) : null}
                                    </article>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="mt-6">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                      Schedule list
                    </h2>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                          <thead className="border-b border-slate-200 bg-slate-50">
                            <tr className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              <th className="px-4 py-3">Day</th>
                              <th className="px-4 py-3">Time</th>
                              <th className="px-4 py-3">Subject / Period</th>
                              <th className="px-4 py-3">Room</th>
                              <th className="px-4 py-3">Source</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeSchedules.map((schedule, index) => (
                              <tr
                                key={schedule.uuid}
                                className="transition hover:bg-slate-50/80"
                              >
                                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                  {schedule.day_label}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                                  {schedule.start_time} – {schedule.end_time}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`rounded-lg border px-2 py-1 text-[10px] font-semibold ${colorForSchedule(schedule, index)}`}
                                    >
                                      {scheduleCode(schedule)}
                                    </span>
                                    <span className="text-xs font-medium text-slate-700">
                                      {scheduleTitle(schedule)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600">
                                  {schedule.room ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                                      {schedule.room.name}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-semibold ${
                                      schedule.source === 'room'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {schedule.source === 'room'
                                      ? 'From room'
                                      : 'Teacher'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
