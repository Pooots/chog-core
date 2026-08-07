import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import axios from 'axios'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type {
  RoomSchedule,
  ScheduleDay,
} from '@/services/roomScheduleService'
import {
  useCopyRoomScheduleMutation,
  useDeleteRoomScheduleMutation,
  useRoomQuery,
  useRoomSchedulesQuery,
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

function colorForSchedule(schedule: RoomSchedule, index: number) {
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

function scheduleTitle(schedule: RoomSchedule) {
  if (schedule.period_type === 'break') {
    return schedule.notes?.trim() || 'Break'
  }
  if (schedule.period_type === 'recess') {
    return schedule.notes?.trim() || 'Recess'
  }
  return schedule.subject?.name ?? 'Class'
}

function scheduleCode(schedule: RoomSchedule) {
  if (schedule.period_type === 'break') return 'BRK'
  if (schedule.period_type === 'recess') return 'REC'
  return schedule.subject?.code ?? 'N/A'
}

export default function RoomSchedulesPage() {
  const { roomUuid } = useParams({
    from: '/admin/rooms/$roomUuid/schedules',
  })
  const roomQuery = useRoomQuery(roomUuid)
  const schedulesQuery = useRoomSchedulesQuery(roomUuid)
  const deleteSchedule = useDeleteRoomScheduleMutation(roomUuid)
  const copySchedule = useCopyRoomScheduleMutation(roomUuid)
  const room = roomQuery.data
  const schedules = schedulesQuery.data ?? []
  const [pendingDelete, setPendingDelete] = useState<RoomSchedule | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [copyOpen, setCopyOpen] = useState(false)
  const [confirmCopyOpen, setConfirmCopyOpen] = useState(false)
  const [sourceDay, setSourceDay] = useState<ScheduleDay>('monday')
  const [targetDays, setTargetDays] = useState<ScheduleDay[]>([])
  const [replaceExisting, setReplaceExisting] = useState(true)
  const [copyError, setCopyError] = useState('')
  const [copySuccess, setCopySuccess] = useState('')

  const showInitialLoading =
    (roomQuery.isPending || schedulesQuery.isPending) && !room

  const pendingDeleteLabel = pendingDelete
    ? [
        pendingDelete.day_label,
        `${pendingDelete.start_time}–${pendingDelete.end_time}`,
        scheduleTitle(pendingDelete),
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  const confirmDelete = async () => {
    if (!pendingDelete) return

    setDeleteError('')
    setDeleting(true)
    try {
      await deleteSchedule.mutateAsync(pendingDelete.uuid)
      setPendingDelete(null)
    } catch {
      setDeleteError('Unable to delete this schedule.')
    } finally {
      setDeleting(false)
    }
  }

  const sourceDayCount = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.status === 'active' && schedule.day_of_week === sourceDay,
      ).length,
    [schedules, sourceDay],
  )

  const openCopyModal = () => {
    const firstDayWithSchedules =
      WEEK_DAYS.find((day) =>
        schedules.some(
          (schedule) =>
            schedule.status === 'active' && schedule.day_of_week === day.value,
        ),
      )?.value ?? 'monday'
    setSourceDay(firstDayWithSchedules)
    setTargetDays([])
    setReplaceExisting(true)
    setCopyError('')
    setCopySuccess('')
    setConfirmCopyOpen(false)
    setCopyOpen(true)
  }

  const toggleTargetDay = (day: ScheduleDay) => {
    setTargetDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day],
    )
  }

  const requestCopy = () => {
    setCopyError('')
    if (sourceDayCount === 0) {
      setCopyError('Select a source day that already has schedules.')
      return
    }
    if (targetDays.length === 0) {
      setCopyError('Select at least one target day.')
      return
    }
    setConfirmCopyOpen(true)
  }

  const confirmCopy = async () => {
    setCopyError('')
    setCopySuccess('')
    try {
      await copySchedule.mutateAsync({
        source_day: sourceDay,
        target_days: targetDays,
        replace_existing: replaceExisting,
      })
      const sourceLabel =
        WEEK_DAYS.find((day) => day.value === sourceDay)?.label ?? sourceDay
      const targetLabels = targetDays
        .map(
          (day) => WEEK_DAYS.find((option) => option.value === day)?.label ?? day,
        )
        .join(', ')
      setCopySuccess(
        `Copied ${sourceDayCount} period${sourceDayCount === 1 ? '' : 's'} from ${sourceLabel} to ${targetLabels}.`,
      )
      setConfirmCopyOpen(false)
      setCopyOpen(false)
      setTargetDays([])
    } catch (requestError) {
      setConfirmCopyOpen(false)
      if (axios.isAxiosError(requestError)) {
        const validationErrors = requestError.response?.data?.errors as
          | Record<string, string[]>
          | undefined
        const firstValidationError = validationErrors
          ? Object.values(validationErrors)[0]?.[0]
          : undefined
        setCopyError(
          firstValidationError ??
            requestError.response?.data?.message ??
            'Unable to copy the schedule.',
        )
      } else {
        setCopyError('Unable to copy the schedule.')
      }
    }
  }

  const activeSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.status === 'active'),
    [schedules],
  )

  const { startHour, endHour, hourSlots } = useMemo(() => {
    const roomStart = room?.start_time
      ? Math.floor(timeToMinutes(room.start_time) / 60)
      : 7
    const roomEnd = room?.end_time
      ? Math.ceil(timeToMinutes(room.end_time) / 60)
      : 17

    if (activeSchedules.length === 0) {
      const start = Math.min(roomStart, 7)
      const end = Math.max(roomEnd, start + 1)
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
    const start = Math.max(0, Math.floor(Math.min(...minutes) / 60))
    const end = Math.min(
      24,
      Math.max(Math.ceil(Math.max(...minutes) / 60), start + 1),
    )

    return {
      startHour: start,
      endHour: end,
      hourSlots: Array.from({ length: end - start }, (_, i) => start + i),
    }
  }, [activeSchedules, room?.start_time, room?.end_time])

  const schedulesByDay = useMemo(() => {
    const map = new Map<ScheduleDay, RoomSchedule[]>()
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
  // Cards use their exact duration, preventing overlap while keeping the
  // complete scheduled range compact enough to display without vertical scroll.
  const rowHeight = 84

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <Link
            to="/admin/rooms"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>

          {showInitialLoading ? (
            <p className="mt-6 text-sm text-slate-500">Loading schedule…</p>
          ) : null}

          {roomQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this room.
            </div>
          ) : null}

          {room ? (
            <>
              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      Room Calendar
                    </h1>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {room.name} · {room.code}
                    {room.level ? ` · ${room.level.name}` : ''}
                    {room.start_time && room.end_time
                      ? ` · Open ${room.start_time}–${room.end_time}`
                      : ''}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={openCopyModal}
                    disabled={activeSchedules.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Copy className="h-4 w-4 text-blue-600" />
                    Copy Schedule
                  </button>
                  <Link
                    to="/admin/rooms/$roomUuid/schedules/create"
                    params={{ roomUuid }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Schedule
                  </Link>
                </div>
              </div>

              {copySuccess ? (
                <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {copySuccess}
                </p>
              ) : null}

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
                    No room schedules yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Create the first class period to see it on the calendar.
                  </p>
                  <Link
                    to="/admin/rooms/$roomUuid/schedules/create"
                    params={{ roomUuid }}
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
                        <div className="relative z-30 grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50">
                          <div className="sticky left-0 z-40 bg-slate-50 px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
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
                                  {count} period{count === 1 ? '' : 's'}
                                </p>
                              </div>
                            )
                          })}
                        </div>

                        <div className="relative grid grid-cols-[72px_repeat(7,minmax(0,1fr))]">
                          <div className="sticky left-0 z-20 bg-white">
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
                                  const durationMinutes = Math.max(
                                    end - start,
                                    1,
                                  )
                                  const height =
                                    (durationMinutes / totalMinutes) *
                                    hourSlots.length *
                                    rowHeight
                                  const showTime = height >= 28
                                  const showTeacher =
                                    Boolean(schedule.teacher) && height >= 50

                                  return (
                                    <article
                                      key={schedule.uuid}
                                      className={`absolute inset-x-1 overflow-hidden rounded-lg border px-2 shadow-sm ${colorForSchedule(schedule, index)} ${
                                        height < 28
                                          ? 'flex items-center py-1'
                                          : 'py-1.5'
                                      }`}
                                      style={{ top, height }}
                                      title={`${scheduleTitle(schedule)} · ${schedule.start_time}–${schedule.end_time}`}
                                    >
                                      <p className="truncate text-[11px] font-bold">
                                        {scheduleTitle(schedule)}
                                      </p>
                                      {showTime ? (
                                        <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-80">
                                          <Clock3 className="h-3 w-3 shrink-0" />
                                          {schedule.start_time}–
                                          {schedule.end_time}
                                        </p>
                                      ) : null}
                                      {showTeacher ? (
                                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-80">
                                          <GraduationCap className="h-3 w-3 shrink-0" />
                                          {schedule.teacher?.full_name}
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
                    {deleteError ? (
                      <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {deleteError}
                      </p>
                    ) : null}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-left">
                          <thead className="bg-slate-50">
                            <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              <th className="px-4 py-3">Day</th>
                              <th className="px-4 py-3">Time</th>
                              <th className="px-4 py-3">Subject</th>
                              <th className="px-4 py-3">Teacher</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeSchedules.map((schedule, index) => (
                              <tr
                                key={schedule.uuid}
                                className="text-sm text-slate-700 transition hover:bg-slate-50/80"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${colorForSchedule(schedule, index)}`}
                                    >
                                      {scheduleCode(schedule)}
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                      {schedule.day_label}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                    {schedule.start_time} – {schedule.end_time}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {schedule.period_type &&
                                  schedule.period_type !== 'class' ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                      {scheduleTitle(schedule)}
                                    </span>
                                  ) : schedule.subject ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                      {schedule.subject.name}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      No subject
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {schedule.teacher ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                                      {schedule.teacher.full_name}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      No teacher
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      to="/admin/rooms/$roomUuid/schedules/$scheduleUuid/edit"
                                      params={{
                                        roomUuid,
                                        scheduleUuid: schedule.uuid,
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit
                                    </Link>
                                    <button
                                      type="button"
                                      disabled={deleting}
                                      onClick={() => setPendingDelete(schedule)}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Delete
                                    </button>
                                  </div>
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

      <ConfirmModal
        open={Boolean(pendingDelete)}
        tone="danger"
        title="Delete this schedule?"
        description={
          pendingDeleteLabel
            ? `This will permanently remove ${pendingDeleteLabel} from the room calendar.`
            : 'This will permanently remove the schedule from the room calendar.'
        }
        confirmLabel="Delete schedule"
        pending={deleting}
        onCancel={() => {
          if (!deleting) setPendingDelete(null)
        }}
        onConfirm={() => void confirmDelete()}
      />

      {copyOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="copy-schedule-title"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !copySchedule.isPending
            ) {
              setCopyOpen(false)
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Copy className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="copy-schedule-title"
                  className="text-base font-bold text-slate-950"
                >
                  Copy schedule
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Paste one day’s periods onto other days for this room.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Copy from
                <select
                  value={sourceDay}
                  onChange={(event) => {
                    setSourceDay(event.target.value as ScheduleDay)
                    setTargetDays((current) =>
                      current.filter((day) => day !== event.target.value),
                    )
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {WEEK_DAYS.map((day) => {
                    const count =
                      schedules.filter(
                        (schedule) =>
                          schedule.status === 'active' &&
                          schedule.day_of_week === day.value,
                      ).length
                    return (
                      <option key={day.value} value={day.value}>
                        {day.label} ({count} period{count === 1 ? '' : 's'})
                      </option>
                    )
                  })}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  {sourceDayCount} period{sourceDayCount === 1 ? '' : 's'} will
                  be copied.
                </p>
              </label>

              <div>
                <p className="text-sm font-medium text-slate-700">Paste to</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {WEEK_DAYS.filter((day) => day.value !== sourceDay).map(
                    (day) => {
                      const selected = targetDays.includes(day.value)
                      const count =
                        schedules.filter(
                          (schedule) =>
                            schedule.status === 'active' &&
                            schedule.day_of_week === day.value,
                        ).length
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleTargetDay(day.value)}
                          className={`rounded-xl border px-3 py-3 text-left transition ${
                            selected
                              ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-600/10'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                selected ? 'text-blue-700' : 'text-slate-800'
                              }`}
                            >
                              {day.label}
                            </span>
                            {selected ? (
                              <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white">
                                <Check className="h-3 w-3" />
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Currently {count} period{count === 1 ? '' : 's'}
                          </p>
                        </button>
                      )
                    },
                  )}
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(event) => setReplaceExisting(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Replace existing schedules on the selected target days
                  <span className="mt-0.5 block text-xs text-slate-400">
                    Recommended so the pasted day matches the source day.
                  </span>
                </span>
              </label>

              {copyError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {copyError}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={copySchedule.isPending}
                onClick={() => setCopyOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={copySchedule.isPending}
                onClick={requestCopy}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={confirmCopyOpen}
        tone="primary"
        title="Paste schedule to selected days?"
        description={
          <>
            Copy {sourceDayCount} period{sourceDayCount === 1 ? '' : 's'} from{' '}
            {WEEK_DAYS.find((day) => day.value === sourceDay)?.label} to{' '}
            {targetDays
              .map(
                (day) =>
                  WEEK_DAYS.find((option) => option.value === day)?.label ??
                  day,
              )
              .join(', ')}
            {replaceExisting
              ? '. Existing schedules on those days will be replaced.'
              : '.'}
          </>
        }
        confirmLabel="Copy schedule"
        pending={copySchedule.isPending}
        onCancel={() => {
          if (!copySchedule.isPending) setConfirmCopyOpen(false)
        }}
        onConfirm={() => void confirmCopy()}
      />
    </SchoolAdminShell>
  )
}
