import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Building2,
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { useFacultiesQuery } from '@/hooks/useSchoolQueries'

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

export default function FacultiesPage() {
  const { data: faculties = [], isPending, isError, isFetching } =
    useFacultiesQuery()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredFaculties = useMemo(() => {
    const query = search.trim().toLowerCase()

    return faculties.filter((faculty) => {
      const matchesType = typeFilter === 'all' || faculty.type === typeFilter
      const matchesQuery =
        !query ||
        [faculty.name, faculty.code, faculty.type_label, faculty.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))

      return matchesType && matchesQuery
    })
  }, [faculties, search, typeFilter])

  const activeCount = faculties.filter((f) => f.status === 'active').length
  const typeOptions = useMemo(() => {
    const unique = new Map<string, string>()
    faculties.forEach((faculty) => {
      unique.set(faculty.type, faculty.type_label)
    })
    return Array.from(unique.entries())
  }, [faculties])

  const showInitialLoading = isPending && faculties.length === 0

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Faculties
                </h1>
                {isFetching && !showInitialLoading ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Updating…
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Organize academic departments, strands, and school units.
              </p>
            </div>
            <Link
              to="/admin/faculties/create"
              className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Faculty
            </Link>
          </div>

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Total Faculties"
              value={faculties.length}
              color="text-slate-950"
            />
            <SummaryCard
              label="Active"
              value={activeCount}
              color="text-emerald-600"
            />
            <SummaryCard
              label="Inactive"
              value={faculties.length - activeCount}
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
                placeholder="Search faculties..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">All types</option>
              {typeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {showInitialLoading ? (
              <p className="text-sm text-slate-500">Loading faculties…</p>
            ) : null}
            {isError ? (
              <p role="alert" className="text-sm text-red-600">
                Unable to load faculties. Please try again.
              </p>
            ) : null}

            {filteredFaculties.map((faculty) => (
              <article
                key={faculty.uuid}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-slate-900">
                        {faculty.name}
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {faculty.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
                    <Link
                      to="/admin/faculties/$facultyUuid/edit"
                      params={{ facultyUuid: faculty.uuid }}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      aria-label={`Edit ${faculty.name}`}
                      title="Edit faculty"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                    <Sparkles className="h-3 w-3" />
                    {faculty.type_label}
                  </span>
                </div>

                {faculty.description ? (
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                    {faculty.description}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">No description</p>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <Link
                    to="/admin/faculties/$facultyUuid"
                    params={{ facultyUuid: faculty.uuid }}
                    className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    View assigned teachers →
                  </Link>
                  <Link
                    to="/admin/faculties/$facultyUuid/edit"
                    params={{ facultyUuid: faculty.uuid }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {!showInitialLoading && !isError && filteredFaculties.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No faculties found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Create your first faculty to organize your school units.
              </p>
              <Link
                to="/admin/faculties/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Create Faculty
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
