import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { SuperAdminShell } from '@/components/admin/SuperAdminShell'
import { useSchoolsQuery } from '@/hooks/useSchoolQueries'

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: typeof Building2
  color: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl text-white shadow-md ${color}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  )
}

export default function SchoolsPage() {
  const { data: schools = [], isPending, isError, isFetching } =
    useSchoolsQuery()
  const [search, setSearch] = useState('')
  const showInitialLoading = isPending && schools.length === 0

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return schools

    return schools.filter((school) =>
      [
        school.name,
        school.code,
        school.address,
        school.principal?.full_name,
        school.principal?.email,
      ].some((value) => value?.toLowerCase().includes(query)),
    )
  }, [schools, search])

  const activeCount = schools.filter(
    (school) => school.status === 'active',
  ).length
  const pendingCount = schools.length - activeCount

  return (
    <SuperAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Schools
                {isFetching && !showInitialLoading ? (
                  <span className="ml-2 align-middle rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Updating…
                  </span>
                ) : null}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Super Admin — create schools and onboard principal accounts.
              </p>
            </div>
            <Link
              to="/admin/super/school/create"
              className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create School
            </Link>
          </div>

          <section
            aria-label="School summary"
            className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <SummaryCard
              label="Total Schools"
              value={schools.length}
              icon={Building2}
              color="bg-blue-600 shadow-blue-600/20"
            />
            <SummaryCard
              label="Active"
              value={activeCount}
              icon={ShieldCheck}
              color="bg-emerald-500 shadow-emerald-500/20"
            />
            <SummaryCard
              label="Pending"
              value={pendingCount}
              icon={UserRound}
              color="bg-orange-500 shadow-orange-500/20"
            />
            <SummaryCard
              label="Principals"
              value={schools.length}
              icon={UsersRound}
              color="bg-cyan-500 shadow-cyan-500/20"
            />
          </section>

          <div className="mt-5">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search schools..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <section
            aria-label="Schools"
            className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {showInitialLoading ? (
              <p className="text-sm text-slate-500">Loading schools…</p>
            ) : null}
            {isError ? (
              <p role="alert" className="text-sm text-red-600">
                Unable to load schools. Please try again.
              </p>
            ) : null}
            {filteredSchools.map((school) => (
              <article
                key={school.uuid}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-slate-900">
                        {school.name}
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {school.code}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      school.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {school.status.charAt(0).toUpperCase() +
                      school.status.slice(1)}
                  </span>
                </div>

                <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{school.address}</span>
                </p>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                      {school.principal?.full_name.slice(0, 1).toUpperCase() ??
                        '?'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium capitalize text-slate-700">
                        {school.principal?.full_name ?? 'No principal'}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-400">
                        <Mail className="h-3 w-3 shrink-0" />
                        {school.principal?.email ?? 'No email'}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {!showInitialLoading && !isError && filteredSchools.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No schools found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try a different search or create a new school.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </SuperAdminShell>
  )
}
