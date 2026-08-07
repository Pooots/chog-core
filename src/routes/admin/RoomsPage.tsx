import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CalendarClock,
  CalendarDays,
  Clock3,
  DoorOpen,
  Layers3,
  Pencil,
  Plus,
  Search,
  UsersRound,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { useLevelsQuery, useRoomsQuery } from '@/hooks/useSchoolQueries'

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
    </article>
  )
}

export default function RoomsPage() {
  const levelsQuery = useLevelsQuery()
  const roomsQuery = useRoomsQuery()
  const levels = levelsQuery.data ?? []
  const rooms = roomsQuery.data ?? []
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const isError = levelsQuery.isError || roomsQuery.isError
  const isFetching = levelsQuery.isFetching || roomsQuery.isFetching
  const showInitialLoading =
    (levelsQuery.isPending || roomsQuery.isPending) &&
    levels.length === 0 &&
    rooms.length === 0

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rooms.filter((room) => {
      const matchesLevel =
        levelFilter === 'all' || room.level_uuid === levelFilter
      const matchesQuery =
        !query ||
        [
          room.name,
          room.code,
          room.building,
          room.level?.name,
          room.level?.code,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))

      return matchesLevel && matchesQuery
    })
  }, [rooms, search, levelFilter])

  const hasLevels = levels.length > 0

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Rooms
                </h1>
                {isFetching && !showInitialLoading ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Updating…
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Create grade levels first, then assign classrooms to each level.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/admin/rooms/levels/create"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Layers3 className="h-4 w-4 text-blue-600" />
                Create Level
              </Link>
              {hasLevels ? (
                <Link
                  to="/admin/rooms/create"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Room
                </Link>
              ) : (
                <span className="flex items-center gap-2 rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500">
                  <Plus className="h-4 w-4" />
                  Create Room
                </span>
              )}
            </div>
          </div>

          {!showInitialLoading && !hasLevels ? (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
              Create a level first (for example Grade 1), then you can add rooms
              under that level.
            </div>
          ) : null}

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Levels"
              value={levels.length}
              color="text-slate-950"
            />
            <SummaryCard
              label="Rooms"
              value={rooms.length}
              color="text-blue-600"
            />
            <SummaryCard
              label="Active Rooms"
              value={rooms.filter((room) => room.status === 'active').length}
              color="text-emerald-600"
            />
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">Levels</h2>
              {levelFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setLevelFilter('all')}
                  className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Show all levels
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  Click a level to filter rooms
                </p>
              )}
            </div>
            {levels.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {levels.map((level) => {
                  const selected = levelFilter === level.uuid
                  return (
                    <button
                      key={level.uuid}
                      type="button"
                      onClick={() =>
                        setLevelFilter(selected ? 'all' : level.uuid)
                      }
                      aria-pressed={selected}
                      className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                        selected
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-10 w-10 place-items-center rounded-xl ${
                              selected
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            <Layers3 className="h-5 w-5" />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {level.name}
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              {level.code}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            selected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {level.rooms_count ?? 0} rooms
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : !showInitialLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center">
                <Layers3 className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">
                  No levels yet
                </p>
                <Link
                  to="/admin/rooms/levels/create"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create Grade Level
                </Link>
              </div>
            ) : null}
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rooms..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">All levels</option>
              {levels.map((level) => (
                <option key={level.uuid} value={level.uuid}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {showInitialLoading ? (
              <p className="text-sm text-slate-500">Loading rooms…</p>
            ) : null}
            {isError ? (
              <p role="alert" className="text-sm text-red-600">
                Unable to load rooms. Please try again.
              </p>
            ) : null}

            {filteredRooms.map((room) => (
              <article
                key={room.uuid}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                      <DoorOpen className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-slate-900">
                        {room.name}
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {room.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      to="/admin/rooms/$roomUuid/edit"
                      params={{ roomUuid: room.uuid }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Link>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        room.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                    {room.level?.name ?? 'No level'}
                  </span>
                  {room.capacity ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                      <UsersRound className="h-3 w-3" />
                      {room.capacity} seats
                    </span>
                  ) : null}
                  {room.start_time && room.end_time ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold text-cyan-700">
                      <Clock3 className="h-3 w-3" />
                      {room.start_time} – {room.end_time}
                    </span>
                  ) : null}
                </div>

                {room.building ? (
                  <p className="mt-3 text-xs text-slate-500">{room.building}</p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">No building set</p>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to="/admin/rooms/$roomUuid/schedules"
                    params={{ roomUuid: room.uuid }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    View Schedule
                  </Link>
                  <Link
                    to="/admin/rooms/$roomUuid/schedules/create"
                    params={{ roomUuid: room.uuid }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    Create Schedule
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {!showInitialLoading &&
          !isError &&
          hasLevels &&
          filteredRooms.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <DoorOpen className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No rooms found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add a classroom under one of your grade levels.
              </p>
              <Link
                to="/admin/rooms/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Create Room
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
