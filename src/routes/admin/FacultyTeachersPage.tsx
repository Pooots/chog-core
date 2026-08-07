import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import {
  useFacultyQuery,
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

export default function FacultyTeachersPage() {
  const { facultyUuid } = useParams({
    from: '/admin/faculties/$facultyUuid',
  })
  const facultyQuery = useFacultyQuery(facultyUuid)
  const teachersQuery = useTeachersQuery(facultyUuid)
  const faculty = facultyQuery.data
  const teachers = teachersQuery.data ?? []
  const [search, setSearch] = useState('')

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return teachers

    return teachers.filter((teacher) =>
      [
        teacher.full_name,
        teacher.email,
        teacher.employee_id,
        teacher.prc_license,
        teacher.phone_number,
        teacher.position_label,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    )
  }, [teachers, search])

  const activeCount = teachers.filter((teacher) => teacher.status === 'active')
    .length
  const showInitialLoading =
    (facultyQuery.isPending || teachersQuery.isPending) && !faculty
  const isError = facultyQuery.isError || teachersQuery.isError

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <Link
            to="/admin/faculties"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Faculties
          </Link>

          {showInitialLoading ? (
            <p className="mt-6 text-sm text-slate-500">Loading faculty…</p>
          ) : null}

          {facultyQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this faculty. It may have been removed.
            </div>
          ) : null}

          {faculty ? (
            <>
              <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {faculty.name}
                      </h1>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          faculty.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-orange-50 text-orange-600'
                        }`}
                      >
                        {faculty.status.charAt(0).toUpperCase() +
                          faculty.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {faculty.code} · Teachers assigned to this faculty
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        <Sparkles className="h-3 w-3" />
                        {faculty.type_label}
                      </span>
                    </div>
                    {faculty.description ? (
                      <p className="mt-3 max-w-2xl text-sm text-slate-500">
                        {faculty.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Link
                  to="/admin/teachers/create"
                  search={{ faculty: facultyUuid }}
                  className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Teacher
                </Link>
              </div>

              <section className="mt-6 grid gap-3 sm:grid-cols-3">
                <SummaryCard
                  label="Assigned Teachers"
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

              <div className="mt-5">
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search teachers in this faculty..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {teachersQuery.isPending && teachers.length === 0 ? (
                  <p className="text-sm text-slate-500">Loading teachers…</p>
                ) : null}
                {teachersQuery.isError ? (
                  <p role="alert" className="text-sm text-red-600">
                    Unable to load teachers for this faculty.
                  </p>
                ) : null}

                {filteredTeachers.map((teacher) => (
                  <article
                    key={teacher.uuid}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/20">
                          {initials(teacher.full_name) || (
                            <GraduationCap className="h-5 w-5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-bold text-slate-900">
                            {teacher.full_name}
                          </h2>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {teacher.prc_license
                              ? `${teacher.employee_id}-${teacher.prc_license}`
                              : teacher.employee_id}
                          </p>
                        </div>
                      </div>
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
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        <Briefcase className="h-3 w-3" />
                        {teacher.position_label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{teacher.email}</span>
                      </p>
                      {teacher.phone_number ? (
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {teacher.phone_number}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                      <Link
                        to="/admin/teachers/$teacherUuid/schedules"
                        params={{ teacherUuid: teacher.uuid }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        View Schedule
                      </Link>
                      <Link
                        to="/admin/teachers/$teacherUuid/schedules/create"
                        params={{ teacherUuid: teacher.uuid }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Create
                      </Link>
                    </div>
                  </article>
                ))}
              </section>

              {!teachersQuery.isPending &&
              !isError &&
              filteredTeachers.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <GraduationCap className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No teachers assigned yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Assign teachers to this faculty when creating or updating
                    their profile.
                  </p>
                  <Link
                    to="/admin/teachers/create"
                    search={{ faculty: facultyUuid }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Teacher
                  </Link>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
