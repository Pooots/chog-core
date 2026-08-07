import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import axios from 'axios'
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarClock,
  Check,
  DoorOpen,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import type {
  ScheduleDay,
  ScheduleDayOption,
} from '@/services/teacherScheduleService'
import {
  useCreateTeacherScheduleMutation,
  useRoomsQuery,
  useScheduleDaysQuery,
  useSubjectsQuery,
  useTeacherQuery,
} from '@/hooks/useSchoolQueries'

const fallbackDays: ScheduleDayOption[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export default function CreateTeacherSchedulePage() {
  const navigate = useNavigate()
  const { teacherUuid } = useParams({
    from: '/admin/teachers/$teacherUuid/schedules/create',
  })
  const teacherQuery = useTeacherQuery(teacherUuid)
  const daysQuery = useScheduleDaysQuery()
  const teacher = teacherQuery.data
  const subjectsQuery = useSubjectsQuery(
    teacher?.faculty_uuid
      ? { facultyUuid: teacher.faculty_uuid }
      : undefined,
  )
  const roomsQuery = useRoomsQuery()
  const createSchedule = useCreateTeacherScheduleMutation(teacherUuid)

  const days =
    daysQuery.data && daysQuery.data.length > 0
      ? daysQuery.data
      : fallbackDays
  const subjects = useMemo(() => {
    const list = subjectsQuery.data ?? []
    if (!teacher?.faculty_uuid) return []
    return list.filter(
      (subject) => subject.faculty_uuid === teacher.faculty_uuid,
    )
  }, [subjectsQuery.data, teacher?.faculty_uuid])
  const rooms = roomsQuery.data ?? []

  const [dayOfWeek, setDayOfWeek] = useState<ScheduleDay>('monday')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:00')
  const [subjectUuid, setSubjectUuid] = useState('')
  const [roomUuid, setRoomUuid] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const selectedSubjectUuid = subjects.some(
    (subject) => subject.uuid === subjectUuid,
  )
    ? subjectUuid
    : ''

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (startTime >= endTime) {
      setError('End time must be later than start time.')
      return
    }

    if (!teacher?.faculty_uuid) {
      setError('Assign this teacher to a faculty before creating a schedule.')
      return
    }

    try {
      await createSchedule.mutateAsync({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        subject_uuid: selectedSubjectUuid || undefined,
        room_uuid: roomUuid || undefined,
        notes: notes.trim() || undefined,
        status: 'active',
      })
      await navigate({
        to: '/admin/teachers/$teacherUuid/schedules',
        params: { teacherUuid },
      })
    } catch (requestError) {
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
            'Unable to create the schedule.',
        )
      } else {
        setError('Unable to create the schedule.')
      }
    }
  }

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/teachers/$teacherUuid/schedules"
            params={{ teacherUuid }}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {teacher
                ? `Add a class period for ${teacher.full_name}.`
                : 'Add a class period for this teacher.'}
            </p>
            {teacher?.faculty ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <Building2 className="h-3.5 w-3.5" />
                {teacher.faculty.name}
              </p>
            ) : null}
          </div>

          {teacherQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this teacher.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              {!teacherQuery.isPending && teacher && !teacher.faculty_uuid ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  This teacher has no faculty assigned. Assign a faculty on the
                  teacher profile first so subjects can be filtered by
                  department.
                </div>
              ) : null}

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
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Start time
                    <input
                      required
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
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
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    Subject
                  </span>
                  <select
                    value={selectedSubjectUuid}
                    onChange={(event) => setSubjectUuid(event.target.value)}
                    disabled={!teacher?.faculty_uuid}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {!teacher?.faculty_uuid
                        ? 'Assign a faculty first'
                        : subjects.length === 0
                          ? 'No subjects in this department'
                          : 'No subject selected'}
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject.uuid} value={subject.uuid}>
                        {subject.name} ({subject.code})
                        {subject.level ? ` · ${subject.level.name}` : ''}
                      </option>
                    ))}
                  </select>
                  {teacher?.faculty_uuid && subjects.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-400">
                      Create subjects under{' '}
                      {teacher.faculty?.name ?? 'this faculty'} to schedule them
                      here.
                    </p>
                  ) : null}
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <DoorOpen className="h-3.5 w-3.5 text-blue-600" />
                    Room
                  </span>
                  <select
                    value={roomUuid}
                    onChange={(event) => setRoomUuid(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">No room selected</option>
                    {rooms.map((room) => (
                      <option key={room.uuid} value={room.uuid}>
                        {room.name} ({room.code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional notes for this schedule"
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
                  to="/admin/teachers/$teacherUuid/schedules"
                  params={{ teacherUuid }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={
                    createSchedule.isPending ||
                    teacherQuery.isError ||
                    !teacher?.faculty_uuid
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {createSchedule.isPending ? 'Creating…' : 'Create Schedule'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
