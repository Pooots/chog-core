import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  FilePlus2,
  Hash,
  IdCard,
  Mail,
  Pencil,
  Phone,
  Search,
  Users,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { StudentNumberQr } from '@/components/admin/StudentNumberQr'
import {
  useLevelsQuery,
  useStudentsQuery,
} from '@/hooks/useSchoolQueries'
import type { StudentEnrollmentStatus } from '@/services/studentService'

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

function enrollmentBadgeClass(status: StudentEnrollmentStatus) {
  if (status === 'enrolled') return 'bg-emerald-50 text-emerald-600'
  if (status === 'pending') return 'bg-blue-50 text-blue-600'
  return 'bg-orange-50 text-orange-600'
}

function isNewThisTerm(enrollmentDate: string | null, createdAt: string) {
  const raw = enrollmentDate ?? createdAt
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return false

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 6)
  return date >= cutoff
}

export default function RegistrarPage() {
  const studentsQuery = useStudentsQuery()
  const levelsQuery = useLevelsQuery()
  const students = studentsQuery.data ?? []
  const levels = levelsQuery.data ?? []
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const isError = studentsQuery.isError
  const isFetching = studentsQuery.isFetching
  const showInitialLoading = studentsQuery.isPending && students.length === 0

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesLevel =
        levelFilter === 'all' || student.level_uuid === levelFilter
      const matchesQuery =
        !query ||
        [
          student.full_name,
          student.lrn_number,
          student.student_number,
          student.email,
          student.phone_number,
          student.level?.name,
          student.room?.name,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))

      return matchesLevel && matchesQuery
    })
  }, [students, search, levelFilter])

  const enrolledCount = students.filter(
    (student) => student.enrollment_status === 'enrolled',
  ).length
  const pendingCount = students.filter(
    (student) => student.enrollment_status === 'pending',
  ).length
  const newThisTermCount = students.filter((student) =>
    isNewThisTerm(student.enrollment_date, student.created_at),
  ).length

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Registrar
                </h1>
                {isFetching && !showInitialLoading ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Updating…
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Manage student enrollment, records, and registration workflows.
              </p>
            </div>
            <Link
              to="/admin/registrar/enroll"
              className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FilePlus2 className="h-4 w-4" />
              Enroll Student
            </Link>
          </div>

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Enrolled Students"
              value={enrolledCount}
              color="text-slate-950"
            />
            <SummaryCard
              label="Pending Applications"
              value={pendingCount}
              color="text-blue-600"
            />
            <SummaryCard
              label="New This Term"
              value={newThisTermCount}
              color="text-emerald-600"
            />
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students..."
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

          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {showInitialLoading ? (
              <p className="p-5 text-sm text-slate-500">Loading students…</p>
            ) : null}
            {isError ? (
              <p role="alert" className="p-5 text-sm text-red-600">
                Unable to load students. Please try again.
              </p>
            ) : null}

            {!showInitialLoading && !isError && filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      <th className="px-5 py-3.5">Student</th>
                      <th className="px-4 py-3.5">LRN Number</th>
                      <th className="px-4 py-3.5">Student Number</th>
                      <th className="px-4 py-3.5">Level / Room</th>
                      <th className="px-4 py-3.5">Contact</th>
                      <th className="px-4 py-3.5">Enrollment</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.uuid}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-600/20">
                              {initials(student.full_name) || (
                                <Users className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {student.full_name}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {student.enrollment_date
                                  ? `Enrolled ${student.enrollment_date}`
                                  : 'No enrollment date'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <IdCard className="h-3.5 w-3.5 text-slate-400" />
                            {student.lrn_number}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <StudentNumberQr
                              studentNumber={student.student_number}
                              size={40}
                              showLabel={false}
                              className="!p-1.5"
                            />
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Hash className="h-3.5 w-3.5 text-slate-400" />
                              {student.student_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-slate-600">
                          <p>{student.level?.name ?? 'No level'}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {student.room?.name ?? 'No room'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {student.email ? (
                              <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                {student.email}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400">
                                No email
                              </p>
                            )}
                            {student.phone_number ? (
                              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Phone className="h-3.5 w-3.5" />
                                {student.phone_number}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${enrollmentBadgeClass(
                              student.enrollment_status,
                            )}`}
                          >
                            {student.enrollment_status_label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/admin/registrar/$studentUuid/edit"
                              params={{ studentUuid: student.uuid }}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
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

          {!showInitialLoading && !isError && filteredStudents.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No students found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Enroll your first student to start building school records.
              </p>
              <Link
                to="/admin/registrar/enroll"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <FilePlus2 className="h-4 w-4" />
                Enroll Student
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
