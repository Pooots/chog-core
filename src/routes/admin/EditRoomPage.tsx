import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import axios from 'axios'
import { ArrowLeft, Clock3, DoorOpen } from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { RoomStatus } from '@/services/roomService'
import {
  useLevelsQuery,
  useRoomQuery,
  useUpdateRoomMutation,
} from '@/hooks/useSchoolQueries'

export default function EditRoomPage() {
  const navigate = useNavigate()
  const { roomUuid } = useParams({ from: '/admin/rooms/$roomUuid/edit' })
  const roomQuery = useRoomQuery(roomUuid)
  const levelsQuery = useLevelsQuery()
  const updateRoom = useUpdateRoomMutation(roomUuid)

  const room = roomQuery.data
  const levels = levelsQuery.data ?? []

  const [levelUuid, setLevelUuid] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [capacity, setCapacity] = useState('')
  const [building, setBuilding] = useState('')
  const [startTime, setStartTime] = useState('07:30')
  const [endTime, setEndTime] = useState('16:00')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<RoomStatus>('active')
  const [initialized, setInitialized] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!room || initialized) return
    setLevelUuid(room.level_uuid)
    setName(room.name)
    setCode(room.code)
    setCapacity(room.capacity != null ? String(room.capacity) : '')
    setBuilding(room.building ?? '')
    setStartTime(room.start_time ?? '07:30')
    setEndTime(room.end_time ?? '16:00')
    setDescription(room.description ?? '')
    setStatus(room.status)
    setInitialized(true)
  }, [room, initialized])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!levelUuid) {
      setError('Select a level for this room.')
      return
    }

    if (startTime >= endTime) {
      setError('End time must be later than start time.')
      return
    }

    setConfirmOpen(true)
  }

  const confirmUpdate = async () => {
    setError('')

    try {
      await updateRoom.mutateAsync({
        level_uuid: levelUuid,
        name: name.trim(),
        code: code.trim(),
        capacity: capacity ? Number(capacity) : undefined,
        building: building.trim() || undefined,
        start_time: startTime,
        end_time: endTime,
        description: description.trim() || undefined,
        status,
      })
      setConfirmOpen(false)
      await navigate({ to: '/admin/rooms' })
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
            'Unable to update the room.',
        )
      } else {
        setError('Unable to update the room.')
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
              Edit Room
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update classroom details, level, hours, and status.
            </p>
          </div>

          {roomQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this room.
            </div>
          ) : roomQuery.isPending || !initialized ? (
            <p className="mt-6 text-sm text-slate-500">Loading room…</p>
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
                  value={levelUuid}
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

              <label className="block text-sm font-medium text-slate-700">
                Status
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as RoomStatus)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  disabled={updateRoom.isPending || levels.length === 0}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {updateRoom.isPending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        tone="primary"
        title="Save room changes?"
        description="This will update the classroom details shown on the rooms list and calendar."
        confirmLabel="Save changes"
        pending={updateRoom.isPending}
        onCancel={() => {
          if (!updateRoom.isPending) setConfirmOpen(false)
        }}
        onConfirm={() => void confirmUpdate()}
      />
    </SchoolAdminShell>
  )
}
