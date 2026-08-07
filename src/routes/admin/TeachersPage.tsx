import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Briefcase,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import {
  useTeacherPositionsQuery,
  useTeachersQuery,
} from '@/hooks/useSchoolQueries'

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

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function TeachersPage() {
  const teachersQuery = useTeachersQuery()
  const positionsQuery = useTeacherPositionsQuery()
  const teachers = teachersQuery.data ?? []
  const positions = positionsQuery.data ?? []
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')

  const isError = teachersQuery.isError
  const isFetching = teachersQuery.isFetching
  const showInitialLoading = teachersQuery.isPending && teachers.length === 0

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return teachers.filter((teacher) => {
      const matchesPosition =
        positionFilter === 'all' || teacher.position === positionFilter
      const matchesQuery =
        !query ||
        [
          teacher.full_name,
          teacher.email,
          teacher.employee_id,
          teacher.prc_license,
          teacher.phone_number,
          teacher.position_label,
          teacher.faculty?.name,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))

      return matchesPosition && matchesQuery
    })
  }, [teachers, search, positionFilter])

  const activeCount = teachers.filter((teacher) => teacher.status === 'active')
    .length

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Teachers
                </h1>
                {isFetching && !showInitialLoading ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Updating…
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Manage teaching staff and their positions across your school.
              </p>
            </div>
            <Link
              to="/admin/teachers/create"
              search={{ faculty: undefined }}
              className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Teacher
            </Link>
          </div>

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Total Teachers"
              value={teachers.length}
              color="text-slate-950"
            />
            <SummaryCard
              label="Active"
              value={activeCount}
              color="text-emerald-600"
            />
            <SummaryCard
              label="Inactive"
              value={teachers.length - activeCount}
              color="text-orange-600"
            />
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search teachers..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <select
              value={positionFilter}
              onChange={(event) => setPositionFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">All positions</option>
              {positions.map((position) => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>

          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {showInitialLoading ? (
              <p className="p-5 text-sm text-slate-500">Loading teachers…</p>
            ) : null}
            {isError ? (
              <p role="alert" className="p-5 text-sm text-red-600">
                Unable to load teachers. Please try again.
              </p>
            ) : null}

            {!showInitialLoading && !isError && filteredTeachers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      <th className="px-5 py-3.5">Teacher</th>
                      <th className="px-4 py-3.5">Position</th>
                      <th className="px-4 py-3.5">Department</th>
                      <th className="px-4 py-3.5">Contact</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers.map((teacher) => (
                      <tr
                        key={teacher.uuid}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-600/20">
                              {initials(teacher.full_name) || (
                                <GraduationCap className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {teacher.full_name}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {teacher.prc_license
                                  ? `${teacher.employee_id}-${teacher.prc_license}`
                                  : teacher.employee_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                            <Briefcase className="h-3 w-3" />
                            {teacher.position_label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-slate-600">
                          {teacher.faculty?.name ?? 'Not assigned'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {teacher.email}
                            </p>
                            {teacher.phone_number ? (
                              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Phone className="h-3.5 w-3.5" />
                                {teacher.phone_number}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              teacher.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-orange-50 text-orange-600'
                            }`}
                          >
                            {teacher.status.charAt(0).toUpperCase() +
                              teacher.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/admin/teachers/$teacherUuid/edit"
                              params={{ teacherUuid: teacher.uuid }}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            <Link
                              to="/admin/teachers/$teacherUuid/schedules"
                              params={{ teacherUuid: teacher.uuid }}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <CalendarDays className="h-3.5 w-3.5" />
                              View Schedule
                            </Link>
                            <Link
                              to="/admin/teachers/$teacherUuid/schedules/create"
                              params={{ teacherUuid: teacher.uuid }}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                            >
                              <CalendarClock className="h-3.5 w-3.5" />
                              Create Schedule
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          {!showInitialLoading &&
          !isError &&
          filteredTeachers.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <GraduationCap className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No teachers found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add your first teacher to start building the faculty roster.
              </p>
              <Link
                to="/admin/teachers/create"
                search={{ faculty: undefined }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Create Teacher
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
