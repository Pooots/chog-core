import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { ArrowLeft, Clock3, DoorOpen, Layers3 } from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import {
  useCreateRoomMutation,
  useLevelsQuery,
} from '@/hooks/useSchoolQueries'

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const levelsQuery = useLevelsQuery()
  const createRoom = useCreateRoomMutation()
  const levels = levelsQuery.data ?? []
  const [levelUuid, setLevelUuid] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [capacity, setCapacity] = useState('')
  const [building, setBuilding] = useState('')
  const [startTime, setStartTime] = useState('07:30')
  const [endTime, setEndTime] = useState('16:00')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const selectedLevelUuid = levelUuid || levels[0]?.uuid || ''
  const isLoadingLevels = levelsQuery.isPending && levels.length === 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!selectedLevelUuid) {
      setError('Create a level first before adding rooms.')
      return
    }

    if (startTime >= endTime) {
      setError('End time must be later than start time.')
      return
    }

    try {
      await createRoom.mutateAsync({
        level_uuid: selectedLevelUuid,
        name: name.trim(),
        code: code.trim(),
        capacity: capacity ? Number(capacity) : undefined,
        building: building.trim() || undefined,
        start_time: startTime,
        end_time: endTime,
        description: description.trim() || undefined,
        status: 'active',
      })
      await navigate({ to: '/admin/rooms' })
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
            'Unable to create the room.',
        )
      } else {
        setError('Unable to create the room.')
      }
    }
  }

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/rooms"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create Room
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Select a grade level, then add the classroom details.
            </p>
          </div>

          {!isLoadingLevels && levels.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Layers3 className="h-4 w-4" />
                Level required
              </div>
              <p className="mt-2 text-sm text-amber-700">
                You need to create a level first (for example Grade 1) before
                creating rooms.
              </p>
              <Link
                to="/admin/rooms/levels/create"
                className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Create Level
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Room details
                </h2>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Level
                <select
                  required
                  value={selectedLevelUuid}
                  onChange={(event) => setLevelUuid(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {levels.map((level) => (
                    <option key={level.uuid} value={level.uuid}>
                      {level.name} ({level.code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Room name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Room 101"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Room code
                  <input
                    required
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toUpperCase())
                    }
                    placeholder="e.g. R101"
                    maxLength={50}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Capacity
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(event) => setCapacity(event.target.value)}
                    placeholder="e.g. 40"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Building
                <input
                  value={building}
                  onChange={(event) => setBuilding(event.target.value)}
                  placeholder="e.g. Main Building"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <section className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Daily schedule
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Start and end time for this room each school day.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              </section>

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional short description"
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

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
                  to="/admin/rooms"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={createRoom.isPending || levels.length === 0}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {createRoom.isPending ? 'Creating…' : 'Create Room'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
