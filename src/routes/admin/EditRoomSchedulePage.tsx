import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import axios from 'axios'
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Check,
  Clock3,
  GraduationCap,
  Layers3,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type {
  ScheduleDay,
  ScheduleDayOption,
  SchedulePeriodType,
} from '@/services/roomScheduleService'
import {
  useRoomQuery,
  useRoomScheduleDaysQuery,
  useRoomScheduleQuery,
  useRoomSchedulesQuery,
  useSubjectsQuery,
  useTeachersQuery,
  useUpdateRoomScheduleMutation,
} from '@/hooks/useSchoolQueries'

const PERIOD_OPTIONS: Array<{
  value: SchedulePeriodType
  label: string
  hint: string
}> = [
  { value: 'class', label: 'Class', hint: 'Regular subject period' },
  { value: 'break', label: 'Break', hint: 'Short break between classes' },
  { value: 'recess', label: 'Recess', hint: 'Recess or lunch period' },
]

const fallbackDays: ScheduleDayOption[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export default function EditRoomSchedulePage() {
  const navigate = useNavigate()
  const { roomUuid, scheduleUuid } = useParams({
    from: '/admin/rooms/$roomUuid/schedules/$scheduleUuid/edit',
  })
  const roomQuery = useRoomQuery(roomUuid)
  const scheduleQuery = useRoomScheduleQuery(roomUuid, scheduleUuid)
  const daysQuery = useRoomScheduleDaysQuery()
  const room = roomQuery.data
  const schedule = scheduleQuery.data
  const levelUuid = room?.level_uuid
  const subjectsQuery = useSubjectsQuery(
    levelUuid ? { levelUuid } : undefined,
  )
  const schedulesQuery = useRoomSchedulesQuery(roomUuid)

  const [dayOfWeek, setDayOfWeek] = useState<ScheduleDay>('monday')
  const [periodType, setPeriodType] = useState<SchedulePeriodType>('class')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:00')
  const [subjectUuid, setSubjectUuid] = useState('')
  const [teacherUuid, setTeacherUuid] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isClassPeriod = periodType === 'class'

  const takenSubjectUuids = useMemo(() => {
    const taken = new Set<string>()
    for (const item of schedulesQuery.data ?? []) {
      if (item.uuid === scheduleUuid) continue
      if (item.status !== 'active') continue
      if (item.day_of_week !== dayOfWeek) continue
      if (item.subject_uuid) taken.add(item.subject_uuid)
    }
    return taken
  }, [schedulesQuery.data, dayOfWeek, scheduleUuid])

  const subjects = useMemo(
    () =>
      (subjectsQuery.data ?? []).filter(
        (subject) => !takenSubjectUuids.has(subject.uuid),
      ),
    [subjectsQuery.data, takenSubjectUuids],
  )
  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.uuid === subjectUuid) ?? null,
    [subjects, subjectUuid],
  )

  const teachersQuery = useTeachersQuery(
    selectedSubject?.faculty_uuid
      ? { facultyUuid: selectedSubject.faculty_uuid }
      : levelUuid
        ? { levelUuid }
        : undefined,
  )
  const updateSchedule = useUpdateRoomScheduleMutation(roomUuid, scheduleUuid)

  const days =
    daysQuery.data && daysQuery.data.length > 0
      ? daysQuery.data
      : fallbackDays
  const teachers = teachersQuery.data ?? []
  const selectedDayLabel =
    days.find((option) => option.value === dayOfWeek)?.label ?? dayOfWeek

  useEffect(() => {
    if (!schedule || initialized) return
    setDayOfWeek(schedule.day_of_week)
    setPeriodType(schedule.period_type ?? 'class')
    setStartTime(schedule.start_time)
    setEndTime(schedule.end_time)
    setSubjectUuid(schedule.subject_uuid ?? '')
    setTeacherUuid(schedule.teacher_uuid ?? '')
    setNotes(schedule.notes ?? '')
    setInitialized(true)
  }, [schedule, initialized])

  useEffect(() => {
    if (!initialized || !teacherUuid) return
    if (!teachers.some((teacher) => teacher.uuid === teacherUuid)) {
      setTeacherUuid('')
    }
  }, [teachers, teacherUuid, initialized])

  useEffect(() => {
    if (!initialized || !subjectUuid) return
    if (!subjects.some((subject) => subject.uuid === subjectUuid)) {
      setSubjectUuid('')
    }
  }, [subjects, subjectUuid, initialized])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (startTime >= endTime) {
      setError('End time must be later than start time.')
      return
    }

    setConfirmOpen(true)
  }

  const confirmUpdate = async () => {
    setError('')

    try {
      await updateSchedule.mutateAsync({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        period_type: periodType,
        subject_uuid: isClassPeriod ? subjectUuid || null : null,
        teacher_uuid: isClassPeriod ? teacherUuid || null : null,
        notes: notes.trim() || null,
        status: 'active',
      })
      setConfirmOpen(false)
      await navigate({
        to: '/admin/rooms/$roomUuid/schedules',
        params: { roomUuid },
      })
    } catch (requestError) {
      setConfirmOpen(false)
      if (axios.isAxiosError(requestError)) {
        const validationErrors = requestError.response?.data?.errors as
          | Record<string, string[]>
          | undefined
        const firstValidationError = validationErrors
          ? Object.values(validationErrors)[0]?.[0]
          : undefined
        setError(
          firstValidationError ??
            requestError.response?.data?.message ??
            'Unable to update the schedule.',
        )
      } else {
        setError('Unable to update the schedule.')
      }
    }
  }

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/rooms/$roomUuid/schedules"
            params={{ roomUuid }}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Edit Room Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {room
                ? `Update the class period for ${room.name}.`
                : 'Update this room class period.'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {room?.level ? (
                <p className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  <Layers3 className="h-3.5 w-3.5" />
                  {room.level.name}
                </p>
              ) : null}
              {room?.start_time && room?.end_time ? (
                <p className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  Room hours {room.start_time} – {room.end_time}
                </p>
              ) : null}
            </div>
          </div>

          {roomQuery.isError || scheduleQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this schedule.
            </div>
          ) : scheduleQuery.isPending || !initialized ? (
            <p className="mt-6 text-sm text-slate-500">Loading schedule…</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <section>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Which day is this schedule for?
                  </h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {days.map((option) => {
                    const selected = dayOfWeek === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDayOfWeek(option.value)}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
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
                            {option.label}
                          </span>
                          {selected ? (
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Class time
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Start time
                    <input
                      required
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      min={room?.start_time ?? undefined}
                      max={room?.end_time ?? undefined}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    End time
                    <input
                      required
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      min={room?.start_time ?? undefined}
                      max={room?.end_time ?? undefined}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Period type
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {PERIOD_OPTIONS.map((option) => {
                      const selected = periodType === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPeriodType(option.value)
                            if (option.value !== 'class') {
                              setSubjectUuid('')
                              setTeacherUuid('')
                            }
                          }}
                          className={`rounded-xl border px-3 py-3 text-left transition ${
                            selected
                              ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-600/10'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`block text-sm font-semibold ${
                              selected ? 'text-blue-700' : 'text-slate-800'
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-400">
                            {option.hint}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {isClassPeriod ? (
                  <>
                    <label className="block text-sm font-medium text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                        Subject
                      </span>
                      <select
                        value={subjectUuid}
                        onChange={(event) => {
                          setSubjectUuid(event.target.value)
                          setTeacherUuid('')
                        }}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="">No subject selected</option>
                        {subjects.map((subject) => (
                          <option key={subject.uuid} value={subject.uuid}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-slate-400">
                        Showing subjects for{' '}
                        {room?.level?.name ?? 'this room grade'} that are not yet
                        scheduled on {selectedDayLabel}.
                      </p>
                      {subjects.length === 0 && takenSubjectUuids.size > 0 ? (
                        <p className="mt-1.5 text-xs text-amber-600">
                          All {room?.level?.name ?? 'grade'} subjects are already
                          scheduled on {selectedDayLabel}.
                        </p>
                      ) : null}
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                        Teacher
                      </span>
                      <select
                        value={teacherUuid}
                        onChange={(event) => setTeacherUuid(event.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="">No teacher selected</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.uuid} value={teacher.uuid}>
                            {teacher.full_name} ({teacher.employee_id})
                            {teacher.faculty
                              ? ` · ${teacher.faculty.name}`
                              : ''}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-slate-400">
                        {selectedSubject
                          ? `Showing teachers from ${selectedSubject.faculty?.name ?? 'the subject faculty'}.`
                          : `Showing teachers for ${room?.level?.name ?? 'this room grade'} faculties.`}
                      </p>
                    </label>
                  </>
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    Subject and teacher are not needed for{' '}
                    {periodType === 'break' ? 'break' : 'recess'} periods.
                  </p>
                )}

                <label className="block text-sm font-medium text-slate-700">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={
                      isClassPeriod
                        ? 'Optional notes for this schedule'
                        : periodType === 'break'
                          ? 'Optional break notes (e.g. Morning break)'
                          : 'Optional recess notes (e.g. Lunch recess)'
                    }
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </section>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <Link
                  to="/admin/rooms/$roomUuid/schedules"
                  params={{ roomUuid }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={updateSchedule.isPending}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {updateSchedule.isPending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        tone="primary"
        title="Save schedule changes?"
        description="This will update the room calendar with your new day, time, subject, and teacher details."
        confirmLabel="Save changes"
        pending={updateSchedule.isPending}
        onCancel={() => {
          if (!updateSchedule.isPending) setConfirmOpen(false)
        }}
        onConfirm={() => void confirmUpdate()}
      />
    </SchoolAdminShell>
  )
}
